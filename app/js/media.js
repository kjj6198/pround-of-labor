
export function getDevice(device) {
  if (typeof device !== 'undefined') {
    if (window.matchMedia("(max-width: 500px)").matches) {
      return device === 'mobile';
    } else if (window.matchMedia("(min-width: 501px) and (max-width: 960px)").matches) {
      return device === 'tablet';
    } else if (window.matchMedia("(min-width: 961px)").matches) {
      return device === 'desktop';
    }

    return false;
  }

  if (window.matchMedia("(max-width: 500px)").matches) {
    return 'mobile';
  } else if (window.matchMedia("(min-width: 501px) and (max-width: 960px)").matches) {
    return 'tablet';
  } else if (window.matchMedia("(min-width: 961px)").matches) {
    return 'desktop';    
  }

  return 'desktop';
}