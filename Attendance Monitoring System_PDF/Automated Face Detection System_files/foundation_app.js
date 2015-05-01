/*** GA and Comscore ***/
$(window).load(function() {
  if (!slideshare_object || !slideshare_object.slideshow ||
      !slideshare_object.slideshow.is_private) {
    // Load GA and Comscore on all but private presos.
    slideshare_object.loadGAandComscore();
  }
});

$(function() {
  // Foundation init
  $(document).foundation({
    abide: {
      // Disable validation after each input event
      live_validate : false
    }
  });

  $('body').on('click', '[data-ga-cat]', function() {
    var gaCategory = $(this).data('ga-cat');
    var gaAction = $(this).data('ga-action');
    var gaLabel = $(this).data('ga-label');
    var gaValue = $(this).data('ga-value');
    var gaNonInteractive = $(this).data('ga-noninteractive') || false;

    if (gaCategory && gaAction) {
      slideshare_object.ga(gaCategory, gaAction, gaLabel, gaValue, gaNonInteractive);
    }
  });

  /*** APP init ***/

  slideshare_object.setLanguageSelector();

  slideshare_object.autosuggestTop();

  slideshare_object.lazyloadThumbnails();

  var auth_token = $('meta[name="csrf-token"]').attr('content');

  $.ajaxSetup({
    beforeSend: function(xhr, req) {
      if(req.type === 'GET') {
        return;
      }

      // returns the hostname of a url
      function url_hostname(url) {
        var a = document.createElement('a');

        // converting relative url to absolute url for hostname resolution on IE
        a.href = url;
        var tempUrl = a.href;
        a.href = tempUrl;
        return a.hostname;
      }

      // Add CSRF token to same origin requests
      if (url_hostname(req.url) === window.location.hostname) {
        xhr.setRequestHeader('X-CSRF-Token', auth_token);
      }
    }
  });

  // Mobile search bar

  var toggleSearchBar = function() {
    var $body = $('body');
    var $mobileSearch = $('#main-nav-mobile-search');

    if ($mobileSearch.is(':visible')) {
      $mobileSearch.hide().find('input').blur();
    } else {
      $mobileSearch.slideDown().find('input').focus();
    }
  };

  $('body').on('click', '.j-open-mobile-search', function(e) {
    e.stopPropagation();
    e.preventDefault();
    toggleSearchBar();
  });

  $('#main-nav-mobile-search form').on('submit', function(e) {
    $('#main-nav-mobile-search').addClass("searching");
  });

  // Global body click handler

  $('body').on('click', function(e) {
    // Check if click is outside mobile search
    if ($(e.target).closest("#main-nav-mobile-search").length <= 0) {
      if ($('#main-nav-mobile-search').is(':visible')) {
        e.stopPropagation();
        e.preventDefault();
        toggleSearchBar();
      }
    }
  });

  // Makes sure lazyload is triggered when the page loads

  $(window).load(function(){
    var $body = $('body');
    var $main_nav = $('#main-nav');

    // Update the html body padding top based on the height of the fixed main_nav
    var updateBodyPaddingTop = function() {
      $body.css('padding-top', $main_nav.height());
    };

    // Determine if the Term of Service banner should be shown and display it
    var initTOSBanner = function() {
      var $tosBanner = $('.j-tos-update-banner');
      var $showText = mobile_util.isMobile() ? $('.j-mobile-text') : $('.j-desktop-text');
      var displayCount = parseInt(mobile_util.getCookie('tos_update_banner_shows'), 10);
      displayCount = isNaN(displayCount) ? 0 : displayCount;
      var numToShow = mobile_util.isMobile() ? 1 : 2;
      if ($tosBanner.length && displayCount < numToShow) {
        $tosBanner.show();
        $showText.show();
        updateBodyPaddingTop();
        mobile_util.setCookie('tos_update_banner_shows', displayCount + 1, 365);

        $tosBanner.find('.j-tos-close').on('click', function(e) {
          $tosBanner.hide();
          $showText.hide();
          updateBodyPaddingTop();
        });
      }
    };

    $(window).resize(function(){
      // Resize the main_nav and body to the correct positions
      updateBodyPaddingTop();
    });

    // TOS Update Banner; Disabled when not needed
    // initTOSBanner();

    $("html,body, body .wrapper").trigger("scroll");
  });

  $(document).ready(function() {
    // Mobile Promotions
    if (typeof mobile_util === 'undefined') {
      return;
    }

    var overlayConfig;
    var splashDefaultConfig;
    
    // Attempt Deeplink on ios8
    // Try deeplinking on ios even in WebViews (The assumption is that deeplinker pages will never be opened 
    // in the slideshare ios app webview)
    if (mobile_util.isIOS8() &&
      slideshare_object.slideshow &&
      slideshare_object.slideshow.mobile_app_url) {
      mobile_util.IOSAutoDeepLink(slideshare_object.slideshow.mobile_app_url);
    }

    if (mobile_util.isIOSWebView()) {
      // Don't show promos for iOS in-app webviews
      var _gaq = window._gaq || [];
      _gaq.push(['_trackEvent', slideshare_object.rum_pagekey, "ios_inapp_webview", navigator.userAgent]);
    } else if (mobile_util.isIOS8() && mobile_util.portraitMode()) {
      splashDefaultConfig = {
        'currentPage': slideshare_object.rum_pagekey,
        'promoName': 'ios_default_splash',
        'promoSelector': '#splash-promo',
        'lazyloadClass': '.j-lazyload.j-ios-show, .j-lazyload.j-ios-default-show',
        'downloadSelector': '.j-store_btn',
        'cooloffDays': 28,
        'launchOnInit': true,
        'closedSelector': '.j-close-splash',
        'showSelector': '.j-ios-show, .j-ios-default-show',
        'disableScroll': true
      };
    } else if (mobile_util.isAndroid()) {
      splashDefaultConfig = {
        'currentPage': slideshare_object.rum_pagekey,
        'promoName': 'android_default_splash',
        'promoSelector': '#splash-promo',
        'lazyloadClass': '.j-lazyload.j-android-show, .j-lazyload.j-android-default-show',
        'downloadSelector': '.j-store_btn',
        'closedSelector': '.j-close-splash',
        'cooloffDays': 28,
        'launchOnInit': true,
        'showSelector': '.j-android-show, .j-android-default-show',
        'disableScroll': true
      };
    }
    if (splashDefaultConfig) {
      var splashDefault = new MobilePromo(splashDefaultConfig);
    }
  });
});
