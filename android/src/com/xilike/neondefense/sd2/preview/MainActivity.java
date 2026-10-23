package com.xilike.neondefense.sd2.preview;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.view.WindowManager;
import java.io.IOException;

/** Offline assets served under a stable HTTPS origin; no JS/native bridge. */
public final class MainActivity extends Activity {
  private WebView game;
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    game = new WebView(this);
    game.setBackgroundColor(0xff060a18);
    game.getSettings().setJavaScriptEnabled(true);
    game.getSettings().setDomStorageEnabled(true);
    game.getSettings().setAllowFileAccess(false);
    game.getSettings().setAllowContentAccess(false);
    game.setWebViewClient(new WebViewClient() {
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return true; }
      @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        if (!"https".equals(request.getUrl().getScheme()) || !"neon.local".equals(request.getUrl().getHost())) return new WebResourceResponse("text/plain","UTF-8",403,"Blocked",null,null);
        String path = request.getUrl().getPath();
        if (path.equals("/")) path = "/index.html";
        if (path.contains("..")) return new WebResourceResponse("text/plain","UTF-8",403,"Blocked",null,null);
        String mime=path.endsWith(".js")?"application/javascript":path.endsWith(".html")?"text/html":path.endsWith(".webmanifest")?"application/manifest+json":"application/json";
        try { return new WebResourceResponse(mime,"UTF-8",getAssets().open("game"+path)); }
        catch(IOException e) { return new WebResourceResponse("text/plain","UTF-8",404,"Not found",null,null); }
      }
    });
    setContentView(game);
    game.loadUrl("https://neon.local/");
  }
  @Override public void onPause() { super.onPause(); game.onPause(); }
  @Override public void onResume() { super.onResume(); if(game!=null) game.onResume(); }
  @Override public void onDestroy() { if(game!=null) game.destroy(); super.onDestroy(); }
  @Override public void onBackPressed() { game.evaluateJavascript("if(typeof togglePause==='function')togglePause()",null); }
}
