package org.flupauzo.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayInputStream;
import java.io.IOException;

public class MainActivity extends Activity {
    private static final String BASIS = "https://appassets.androidplatform.net/";

    @Override
    public void onCreate(Bundle zustand) {
        setTheme(android.R.style.Theme_Material_Light_NoActionBar);
        super.onCreate(zustand);

        WebView web = new WebView(this);
        android.widget.FrameLayout rahmen = new android.widget.FrameLayout(this);
        rahmen.setFitsSystemWindows(true);
        rahmen.addView(web, new android.widget.FrameLayout.LayoutParams(-1, -1));
        setContentView(rahmen);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    WebView ansicht, WebResourceRequest anfrage) {
                String url = anfrage.getUrl().toString();
                if (url.startsWith(BASIS)) {
                    String datei = url.substring(BASIS.length());
                    String typ;
                    switch (datei) {
                        case "index.html": typ = "text/html"; break;
                        case "js/app.js": typ = "application/javascript"; break;
                        case "generated/slackwater.tcdb":
                            typ = "application/octet-stream"; break;
                        default: return nichtGefunden();
                    }
                    try {
                        String kodierung = datei.endsWith(".tcdb") ? null : "UTF-8";
                        return new WebResourceResponse(
                            typ, kodierung, getAssets().open(datei));
                    } catch (IOException fehler) {
                        return nichtGefunden();
                    }
                }
                return nichtGefunden();
            }
        });
        web.loadUrl(BASIS + "index.html");
    }

    private static WebResourceResponse nichtGefunden() {
        return new WebResourceResponse("text/plain", "UTF-8", 404,
            "Not Found", null, new ByteArrayInputStream(new byte[0]));
    }
}
