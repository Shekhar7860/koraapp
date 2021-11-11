package com.koraapp.notification;

import android.app.ActivityManager;
import android.app.Application;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.dieam.reactnativepushnotification.modules.RNPushNotificationHelper;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.koraapp.MainActivity;
import com.koraapp.R;

import java.security.SecureRandom;
import java.util.List;

public class NotificationModule extends ReactContextBaseJavaModule {
    private CustomPushNotificationHelper mRNPushNotificationHelper;
    private final SecureRandom mRandomNumberGenerator = new SecureRandom();
    //constructor
    public NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Application applicationContext = (Application) reactContext.getApplicationContext();
        // The @ReactNative methods use this
        mRNPushNotificationHelper = new CustomPushNotificationHelper(applicationContext);
    }
    //Mandatory function getName that specifies the module name
    @Override
    public String getName() {
        return "AndroidNotif";
    }


    //Custom function that we are going to export to JS
    @ReactMethod
    public void getDeviceName(Callback cb) {
        try{
            cb.invoke(null, android.os.Build.MODEL);
        }catch (Exception e){
            cb.invoke(e.toString(), null);
        }
    }

    @ReactMethod
    public  void setNotification(ReadableMap details) {
        Bundle bundle = Arguments.toBundle(details);
        // If notification ID is not provided by the user, generate one at random
        if (bundle.getString("id") == null) {
            bundle.putString("id", String.valueOf(mRandomNumberGenerator.nextInt()));
        }
        mRNPushNotificationHelper.sendToNotificationCentre(bundle);
    }

    @ReactMethod
    public  void clearNotification(double id) {
        if (mRNPushNotificationHelper != null) {
            int idInt = (int) id;
            mRNPushNotificationHelper.clearSingleNotification(idInt + "");
        }
    }


    public boolean isApplicationInForeground() {
        ActivityManager activityManager = (ActivityManager) getReactApplicationContext(). getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> processInfos = activityManager.getRunningAppProcesses();
        if (processInfos != null) {
            for (ActivityManager.RunningAppProcessInfo processInfo : processInfos) {
                if (processInfo.processName.equals(getReactApplicationContext().getPackageName())
                        && processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
                        && processInfo.pkgList.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }
}
