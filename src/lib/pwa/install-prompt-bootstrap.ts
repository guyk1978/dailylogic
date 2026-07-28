/**
 * Blocking inline script — register SW + stash beforeinstallprompt before React hydrates.
 */
export function getInstallPromptBootstrapScript(): string {
  return `(function(){try{window.__dlDeferredInstallPrompt=null;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__dlDeferredInstallPrompt=e;window.dispatchEvent(new CustomEvent("dailylogic:beforeinstallprompt",{detail:e}));});window.addEventListener("appinstalled",function(){window.__dlDeferredInstallPrompt=null;});if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"}).catch(function(){});}}catch(e){}})();`;
}
