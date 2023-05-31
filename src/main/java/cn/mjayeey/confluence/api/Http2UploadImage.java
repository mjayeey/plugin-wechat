package cn.mjayeey.confluence.api;

import com.atlassian.confluence.pages.Attachment;
import com.atlassian.confluence.pages.AttachmentData;
import com.atlassian.confluence.pages.AttachmentManager;
import com.atlassian.spring.container.ContainerManager;
import org.apache.commons.io.IOUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.ByteArrayBody;
import org.apache.http.entity.mime.content.StringBody;

import org.json.JSONException;
import org.json.JSONObject;
import org.apache.commons.io.IOUtils;
import java.io.InputStream;
import java.io.File;
import java.nio.file.Files;

//import hqr.util.Brower;

public class Http2UploadImage {
	private CloseableHttpClient httpclient;
	private HttpClientContext httpClientContext;
	private CloseableHttpResponse cl;
	private String accessToken;
	private String agentid;
	
	public Http2UploadImage(CloseableHttpClient httpclient, HttpClientContext httpClientContext,String accessToken) {
		this.httpclient = httpclient;
		this.httpClientContext = httpClientContext;
		this.accessToken = accessToken;
		this.agentid = "1000004";
	}
	
	public String execute(Attachment attachment) throws Exception {

	    HttpPost post = new HttpPost("https://qyapi.weixin.qq.com/cgi-bin/media/upload?access_token="+accessToken+"&type=image");
	    post.setConfig(Brower.getRequestConfig());
		String fileName = null;
		byte[] data = new byte[0];
		if(attachment == null)
		{
			InputStream inputStream = getClass().getClassLoader().getResourceAsStream("images/image.jpg");
			data = IOUtils.toByteArray(inputStream);
			fileName = "image.jpg";
		}
		else
		{
			AttachmentManager attachmentManager = (AttachmentManager) ContainerManager.getComponent("attachmentManager");
			InputStream inputStream = attachmentManager.getAttachmentData(attachment);
			data = IOUtils.toByteArray(inputStream);
			fileName = attachment.getFileName();
		}
		MultipartEntityBuilder entityBuilder = MultipartEntityBuilder.create()
				.addPart("media", new ByteArrayBody(data, ContentType.create("image/jpeg"), fileName))
				.addPart("type", new StringBody("image", ContentType.DEFAULT_TEXT.withCharset("UTF-8")));
        post.setEntity(entityBuilder.build());
	    
	    this.cl = this.httpclient.execute(post, this.httpClientContext);
	    
	    if(cl.getStatusLine().getStatusCode()==200) {
			try
			{
				final JSONObject jsonObject = new JSONObject(EntityUtils.toString(this.cl.getEntity()));
				String errcode = jsonObject.get("errcode").toString();
				String errmsg = jsonObject.get("errmsg").toString();
				String media_id = jsonObject.get("media_id").toString();
				if("0".equals(errcode)) {
					System.out.println("msg push to user successfully");
					return media_id;
				}
				else {
					System.out.println("failed to push the msg "+jsonObject.get("errmsg").toString());
				}
			}
			catch (final JSONException e)
			{
				throw new RuntimeException("Requesting details of plugin with key");
			}
	    }
	    else {
	    	EntityUtils.toString(this.cl.getEntity());
	    }
	    cl.close();	
		return "errimage";
	}
}
