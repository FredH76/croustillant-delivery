package com.maxieds.chameleonminiusb;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.support.annotation.IntRange;

import com.maxieds.chameleonminiusb.ChameleonDeviceConfig.ChameleonBoardType_t;
import com.maxieds.chameleonminiusb.ChameleonDeviceConfig.ChameleonEmulatedConfigType_t;
import com.maxieds.chameleonminiusb.LibraryLogging.LocalLoggingLevel;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

public interface ChameleonUSBInterface {

    /**
     * Initialize the Chameleon USB library. (!!) THIS MUST BE CALLED (!!) before
     * performing any operations with this interface, or for most of the operations
     * in the ChameleonDeviceConfig class.
     * 
     * @param mainActivityHandler : a reference to the main Android app's activity
     *                            (a simple "this" reference should do it if called
     *                            from within an activity method).
     * @return truth value of whether the initialization operation was successful.
     * @see ChameleonDeviceConfig
     */
    boolean chameleonUSBInterfaceInitialize(Activity mainActivityHandler);

    /**
     * Call one of these functions to initialize the Chameleon USB library. (!!)
     * THIS MUST BE CALLED (!!) before performing any operations with this
     * interface, or for most of the operations in the ChameleonDeviceConfig class.
     * 
     * @param mainActivityHandler : a reference to the main Android app's activity
     *                            (a simple "this" reference should do it if called
     *                            from within an activity method).
     * @param libraryLoggingLevel : level of detail in logging events and data
     *                            generated by the library.
     * @return truth value of whether the initialization operation was successful.
     * @see ChameleonDeviceConfig
     */
    boolean chameleonUSBInterfaceInitialize(Activity mainActivityHandler, LocalLoggingLevel libraryLoggingLevel);

    /**
     * Since the library lacks an activity, we cannot directly receive intents
     * recognizing that a new filtered device we have registered to monitor in the
     * Manifest.xml like the third-party applications can. In order to have the
     * library automatically react to these broadcast intents, the client needs to
     * intercept them in their main activity and pass them on to the library via
     * this interface method.
     * 
     * @param usbRelatedIntent : Ideally with an action of
     *                         ACTION_USB_DEVICE_ATTACHED or
     *                         ACTION_USB_DEVICE_DETACHED.
     */
    void onNewIntent(Intent usbRelatedIntent);

    /**
     * Call this method to close all Chameleon device connections and shutdown any
     * running serial USB routines and/or callbacks. This function will also
     * shutdown the active foreground service used to listen for new Chameleon
     * device connections over the Android device's USB input. DO NOT RE-INITIALIZE
     * THIS LIBRARY AGAIN WITHOUT FIRST CALLING THIS FUNCTION TO DE-INITIALIZE THE
     * EXISTING CONFIGURED INSTANCE!!
     * 
     * @return truth value of whether the operation was successful.
     */
    boolean chameleonUSBInterfaceShutdown();

    /**
     * Tests for whether a Chameleon Mini device is attached to the Android device
     * over USB and appears to be operating correctly.
     * 
     * @return true if a working Chameleon device is attached to the Android phone.
     */
    boolean chameleonPresent();

    /**
     * Tests for whether a Chameleon Mini device is attached to the Android device
     * over USB and appears to be operating correctly.
     * 
     * @param expectedRevType : The expected revision of the connected Chameleon
     *                        Mini board.
     * @return true if a working Chameleon device of the specified type is attached
     *         to the Android phone.
     * @ref ChameleonDeviceConfig.isRevisionEDevice()
     * @ref ChameleonDeviceConfig.isRevisionGDevice()
     */
    boolean chameleonPresent(ChameleonBoardType_t expectedRevType);

    /**
     * Select and optionally prepare slot 1-8 on the Chameleon board for an image to
     * be uploaded via XModem. Note that if a slot corresponds to a different
     * configuration (say, for example, a MIFARE1K vs. MIFARE4K slot, or configs
     * with differing UID sizes), then it is possible in my experience that an
     * upload of a card image over XModem may fail to correctly update the contents
     * of the current slot. Therefore, it is my recommendation that before any
     * XModem upload attempt of an ingested card dump: 1) The desired slot number is
     * selected; 2) The existing contents are cleared from that slot; and 3) The
     * configuration type is preset to the type of image that will be uploaded into
     * the Chameleon over XModem. These two functions will help prepare for the
     * ingested Mifare dumps to be sucessfully uploaded consistently without wierd
     * and/or semi-unpredictable behaviors...
     * 
     * @param slotNumber
     * @param clearSlot
     * @return
     */
    boolean prepareChameleonEmulationSlot(@IntRange(from = 1, to = 8) int slotNumber, boolean clearSlot);

    boolean prepareChameleonEmulationSlot(@IntRange(from = 1, to = 8) int slotNumber, boolean clearSlot,
            ChameleonEmulatedConfigType_t chameleonConfigType);

    /**
     * Initiates an upload of the ingested dump to the current Chameleon slot via
     * XModem. Notice that we have amended the proposed library spec here so that
     * the configuration of the card type, slot to be written into, and the
     * pre-clearing of this slot are handled by a separate routine to be called
     * before these upload dump functions.
     * 
     * @param dumpDataStream : the ingested data bytes (a.k.a. Mifare dumps) to be
     *                       written to the Chameleon.
     * @ref prepareChameleonEmulationSlot
     */
    boolean chameleonUpload(InputStream dumpDataStream);

    boolean chameleonUpload(byte[] dumpDataBytes);

}
