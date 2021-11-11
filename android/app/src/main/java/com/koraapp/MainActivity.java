package com.koraapp;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.Nullable;

import com.facebook.react.ReactActivityDelegate;
import com.google.firebase.crashlytics.FirebaseCrashlytics;
import com.zoontek.rnbootsplash.RNBootSplash; // <- add this necessary import

import java.util.Random;

public class MainActivity extends ReactActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
   RNBootSplash.init(R.drawable.bootsplash, MainActivity.this); // <- display the generated bootsplash.xml drawable over our MainActivity
    FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(true);
    //throw new RuntimeException("Test crash by Challa "+ new Random().nextInt());
  }



  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "KoraApp";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegate(this, getMainComponentName()) {
      @Override
      protected Bundle getLaunchOptions() {

        Bundle initialProps=getIntent().getBundleExtra("notification");
        if(initialProps== null) {
          initialProps = new Bundle();
        }
        return initialProps;
      }
    };
  }

  @Override
public void onNewIntent(Intent intent) {
  super.onNewIntent(intent);
  setIntent(intent);
}
}
