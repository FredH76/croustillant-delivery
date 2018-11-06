package com.maxieds.chameleonminiusb;

//import com.maxieds.chameleonminiusb.ChameleonCommands;
import com.maxieds.chameleonminiusb.ChameleonDeviceConfig;
//import com.maxieds.chameleonminiusb.LibraryLogging;
//import com.maxieds.chameleonminiusb.Utils;
//import com.maxieds.chameleonminiusb.ChameleonLibraryLoggingReceiver;
import com.maxieds.chameleonminiusb.ChameleonUSBInterface;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * This class echoes a string called from JavaScript.
 */
public class ChameleonPlugin extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("coolMethod")) {
            String message = args.getString(0);
            this.coolMethod(message, callbackContext);
            return true;
        }
        return false;
    }

    private void coolMethod(String message, CallbackContext callbackContext) {

        ChameleonUSBInterface usb = new ChameleonDeviceConfig();

        // initialize the Chameleon USB library so it gets up and a' chugging:
        boolean res = usb.chameleonUSBInterfaceInitialize(cordova.getActivity());

        // test if Chameleon is present
        if (ChameleonDeviceConfig.THE_CHAMELEON_DEVICE.chameleonPresent())
            callbackContext.success("USB device CONNECTED");
        else
            callbackContext.error("USB NOT CONNECTED");
    }
}
