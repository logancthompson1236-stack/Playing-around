package com.mallrevival.game;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    // Leaving the app pauses the game: tell the page first, then pause the WebView so it stops
    // drawing and reports itself hidden. Capacitor alone keeps the page running in the background.
    @Override
    public void onPause() {
        super.onPause();
        WebView web = getBridge() != null ? getBridge().getWebView() : null;
        if (web == null) return;
        web.evaluateJavascript("window.mallBackground && window.mallBackground(true)", null);
        web.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        WebView web = getBridge() != null ? getBridge().getWebView() : null;
        if (web == null) return;
        web.onResume();
        web.evaluateJavascript("window.mallBackground && window.mallBackground(false)", null);
    }

    // Full-screen game: hide the status and navigation bars; a swipe from the edge shows them briefly.
    private void hideSystemBars() {
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
