package com.faisal.slapdroid;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SlapServicePlugin.class);
        super.onCreate(savedInstanceState);
    }
}