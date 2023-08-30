const mobileBreakpoint = 800;
let globalWindowWidth = window.innerWidth;

export default function decorate($block) {
  const $rows = [...$block.children];
  const $mobileRow = $rows.find(($row) => $row.children[0].textContent.toLowerCase() === 'mobile');
  const $desktopRow = $rows.find(($row) => $row.children[0].textContent.toLowerCase() === 'desktop');
  const $contentRow = $rows.at(2);

  const [mobileVideo, desktopVideo] = [[$mobileRow, 'mobile'], [$desktopRow, 'desktop']]
    .map(([$row, typeHint]) => {
      const $poster = $row.querySelector('img');
      let optimizedPosterSrc;
      if ($poster) {
        const srcURL = new URL($poster.src);
        const srcUSP = new URLSearchParams(srcURL.search);
        srcUSP.set('format', 'webply');
        srcUSP.set('width', `${typeHint === 'mobile' ? 750 : 2000}`);
        optimizedPosterSrc = `${srcURL.pathname}?${srcUSP.toString()}`;
      }

      return {
        videoUrl: $row.children[1]?.children[1]?.textContent,
        poster: optimizedPosterSrc,
        title: ($poster && $poster.getAttribute('alt')) || '',
      };
    });

  $mobileRow.remove();
  $desktopRow.remove();

  if ($contentRow) {
    // wrap content and buttons
    $contentRow.children[0].classList.add('video-hero-content');
    const $buttonWrapper = document.createElement('div');
    [...$contentRow.children[0].children].slice(1).forEach(($button) => {
      $buttonWrapper.appendChild($button.cloneNode(true));
      $button.remove();
    });
    $buttonWrapper.classList.add('button-wrapper');
    $contentRow.children[0].append($buttonWrapper);

    if (!mobileVideo.videoUrl || !desktopVideo.videoUrl) {
      $block.innerHTML = `Could not find videos (mobile ${mobileVideo.videoUrl}, desktop ${desktopVideo.videoUrl}), check your Hero Animation block`;
    }
  }

  const performLayout = (video) => {
    const videoTag = document.createElement('video');
    videoTag.toggleAttribute('muted', true);
    videoTag.toggleAttribute('autoplay', true);
    videoTag.setAttribute('playsinline', 'true');
    videoTag.setAttribute('loop', 'true');
    videoTag.setAttribute('poster', video.poster);
    videoTag.setAttribute('title', video.title);
    videoTag.setAttribute('width', '1920');
    videoTag.setAttribute('height', '1080');
    videoTag.innerHTML = `<source src="${video.videoUrl}" type="video/mp4">`;
    $contentRow.prepend(videoTag);
    videoTag.muted = true;
  };

  const reLayout = () => {
    if (window.innerWidth < 800) {
      performLayout(mobileVideo);
    } else {
      performLayout(desktopVideo);
    }
  };

  const shouldResize = () => {
    const resize = (window.innerWidth > mobileBreakpoint && globalWindowWidth <= mobileBreakpoint)
      || (window.innerWidth < mobileBreakpoint && globalWindowWidth >= mobileBreakpoint);
    globalWindowWidth = window.innerWidth;
    return resize;
  };

  window.addEventListener('resize', () => {
    if (shouldResize()) {
      $block.querySelector('video').remove();
      reLayout();
    }
  });

  reLayout();
}