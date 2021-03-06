/******************************************************************************
 *
 *  Copyright 2012-2014 Tavendo GmbH.
 *
 *  Licensed under the Apache 2.0 license
 *  http://www.apache.org/licenses/LICENSE-2.0.html
 *
 ******************************************************************************/

"use strict";

var colorPickersCount = 3, // total number of color pickers as contained in the HTML
    currentSubscription = null,
    newWindowLink = null;

function setupDemo() {

   sess.prefix("api", demoPrefix + ".colorpicker");

   newWindowLink = document.getElementById('secondInstance');

   // setup the color pickers
   for (var i = 0; i < colorPickersCount; ++i) {
      setupPicker(i);
   }

   $("#helpButton").click(function() { $(".info_bar").toggle() });

}

function afterAuth() {
   $.farbtastic('#picker0').setColor("#d0b800");
   $.farbtastic('#picker1').setColor("#555");
   $.farbtastic('#picker2').setColor("#fff");
};

// set colors associated with / controlled by a color picker
function setExtraColors(k, color) {
   // adjust background rectangle color / color text value
   $('#color' + k).css('background-color', color);
   $('#colorvalue' + k).text(color);

   $('#colortext' + k).css('background-color', color);

   $('#colortext' + k + 'a').css('color', color);
   $('#colortext' + k + 'b').css('color', color);
   $('#colortext' + k + 'c').css('color', color);

   $('#c' + k + 'a').css('background-color', color);
   $('#c' + k + 'b').css('background-color', color);
}


// setup color picker by index
function setupPicker(k) {
   $('#picker' + k).farbtastic(function onColorChangeLocal(color) {
      // this is the callback fired when the user manipulates a color picker

      // set colors associated with color picker
      setExtraColors(k, color);

      // publish the color change event on our topic
      sess.publish("api:" + controllerChannelId + ".color_change", [{ index: k, color: color }], {}, {acknowledge: true}).then(
         function(publication) {
            console.log("published", publication, "api" + controllerChannelId + ".color_change");

         },
         function(error) {
            console.log("publication error", error);
         }
      );
   });
}


// our event handler for processing remote color changes
function onColorChangeRemote(args, kwargs, details) {
   console.log("color change remote", args, kwargs, details);
   // set color in color picker
   $.farbtastic('#picker' + args[0].index).setColor(args[0].color, true);

   // set colors associated with color picker
   setExtraColors(args[0].index, args[0].color);
};


function onChannelSwitch(oldChannelId, newChannelId) {

   if (oldChannelId) {
      currentSubscription.unsubscribe();
   }

   oldChannelId = newChannelId;

   sess.subscribe("api:" + newChannelId + ".color_change", onColorChangeRemote).then(
      function(subscription) {
         console.log("subscribed", subscription, "api:" + newChannelId + ".color_change");
         currentSubscription = subscription;

      },
      function(error) {
         console.log("subscription error", error);
      }
   );

   newWindowLink.setAttribute('href', window.location.pathname + '?channel=' + newChannelId);
}
