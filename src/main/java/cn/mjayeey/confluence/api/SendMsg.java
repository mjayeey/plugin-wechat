package cn.mjayeey.confluence.api;

import com.atlassian.confluence.pages.AttachmentData;
import com.atlassian.confluence.pages.Attachment;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.impl.client.CloseableHttpClient;

public class SendMsg {
	private CloseableHttpClient httpclient = null;
	private HttpClientContext httpClientContext = null;
	
	public SendMsg(CloseableHttpClient httpclient, HttpClientContext httpClientContext) {
		try {
			this.httpclient = httpclient;
			this.httpClientContext = httpClientContext;
		}
		catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public String execute(String title, String url, String msg, Attachment attachment) {
		try {
			Http1GetToken h1 = new Http1GetToken(httpclient, httpClientContext);
			h1.execute();

			String imageID = "";
			if(attachment != null) {
				Http2UploadImage h2 = new Http2UploadImage(httpclient, httpClientContext, h1.getToken());
				imageID = h2.execute(attachment);
			}

			Http3SendMsg h3 = new Http3SendMsg(httpclient, httpClientContext, h1.getToken());
			h3.execute(title, url, imageID, msg);
			
			httpclient.close();
		}
		catch (Exception e) {
			System.out.println("[!]无法推送微信消息 "+e);
		}
		return "123";
	}
	
}
