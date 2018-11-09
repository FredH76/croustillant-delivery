package com.maxieds.chameleonminiusb;

import java.io.InputStream;

//import com.maxieds.chameleonminiusb.ChameleonCommands;
import com.maxieds.chameleonminiusb.ChameleonDeviceConfig;
//import com.maxieds.chameleonminiusb.LibraryLogging;
//import com.maxieds.chameleonminiusb.Utils;
//import com.maxieds.chameleonminiusb.ChameleonLibraryLoggingReceiver;
import com.maxieds.chameleonminiusb.ChameleonUSBInterface;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.commons.codec.binary.Base64;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ChameleonPlugin extends CordovaPlugin {

    ChameleonUSBInterface usb = null;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        switch (action) {

        case "isPresent":
            this.isPresent(callbackContext);
            return true;

        case "initialize":
            this.initialize(callbackContext);
            return true;

        case "uploadArray":
            JSONObject jsonArray = args.getJSONObject(0);
            byte[] byteArray = new byte[jsonArray.length()];
            for (int i = 0; i < jsonArray.length(); i++) {
                byteArray[i] = (byte) jsonArray.getInt(Integer.toString(i));
            }
            this.uploadArray(badgeArray, callbackContext);
            return true;

        case "uploadFile":
            InputStream binFile = null;// args[0];
            this.uploadFile(binFile, callbackContext);
            return true;

        case "shutdown":
            this.shutdown(callbackContext);
            return true;

        default:
            return false;
        }
    }

    private void isPresent(CallbackContext callbackContext) {

        if (ChameleonDeviceConfig.THE_CHAMELEON_DEVICE.chameleonPresent())
            callbackContext.success("USB device CONNECTED");
        else
            callbackContext.error("USB NOT CONNECTED");
    }

    private void initialize(CallbackContext callbackContext) {

        // initialize the Chameleon USB library so it gets up and a' chugging
        this.usb = new ChameleonDeviceConfig();
        boolean res = this.usb.chameleonUSBInterfaceInitialize(cordova.getActivity());

        if (res)
            callbackContext.success("SUCCESS: USB INITIALIZED");
        else
            callbackContext.error("ERROR: USB NOT INITLALIZED");
    }

    private void uploadArray(byte[] byteArray, CallbackContext callbackContext) {

        boolean res = usb.chameleonUpload(byteArray);

        if (res)
            callbackContext.success("SUCCESS: BYTE ARRAY UPLOAD");
        else
            callbackContext.error("ERROR: BYTE ARRAY NOT UPLOADED");
    }

    private void uploadFile(InputStream binFile, CallbackContext callbackContext) {

        boolean res = usb.chameleonUpload(binFile);

        if (res)
            callbackContext.success("SUCCESS: BIN FILE UPLOAD");
        else
            callbackContext.error("ERROR: BIN FILE NOT UPLOADED");
    }

    private void shutdown(CallbackContext callbackContext) {

        boolean res = this.usb.chameleonUSBInterfaceShutdown();

        if (res)
            callbackContext.success("SUCCESS: USB SHUTDOWN PROPERLY");
        else
            callbackContext.error("ERROR: USB SHUTDOWN MAY HAVE FAILED");

        this.usb = null;
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
