package cn.mjayeey.confluence.api;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;

//import hqr.util.Brower;

public class Http3SendMsg {
	private CloseableHttpClient httpclient;
	private HttpClientContext httpClientContext;
	private CloseableHttpResponse cl;
	private String accessToken;
	private String agentid;
	
	public Http3SendMsg(CloseableHttpClient httpclient, HttpClientContext httpClientContext,String accessToken, String agentid2) {
		this.httpclient = httpclient;
		this.httpClientContext = httpClientContext;
		this.accessToken = accessToken;
		this.agentid = agentid2;

		//str = "{\"touser\": \"@all\",\"msgtype\": \"text\",\"agentid\": \""+agentid+"\",\"text\": {\"content\": \""+content+"\"},\"enable_duplicate_check\": \"1\",\"duplicate_check_interval\": \"3\"}";

	}
	
	public void execute(String reviewers, String title, String url, String picUrl, String pageContent) throws Exception {

		//String str = "{\"touser\": \"@all\",\"msgtype\": \"mpnews\",\"agentid\": \""+agentid+"\",\"mpnews\": {\"articles\": [{\"title\": \""+ title
		//		+ "\",\"content\": \"" + msg + "\",\"content_source_url\": \"" + url + "\",\"thumb_media_id\": \"" + picUrl + "\"}]},\"enable_duplicate_check\": \"1\",\"duplicate_check_interval\": \"3\"}";

		JSONObject article = new JSONObject();
		article.put("title", title);
		article.put("content", pageContent);
		article.put("content_source_url", url);
		article.put("thumb_media_id", picUrl);
	
		JSONArray articles = new JSONArray();
		articles.put(article);
	
		JSONObject mpnews = new JSONObject();
		mpnews.put("articles", articles);
	
		JSONObject json = new JSONObject();
		json.put("touser", reviewers);
		json.put("msgtype", "mpnews");
		json.put("agentid", agentid);
		json.put("mpnews", mpnews);
		json.put("enable_duplicate_check", "1");
		json.put("duplicate_check_interval", "3");
	
		String str = json.toString();
		
		HttpPost post = new HttpPost("https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token="+accessToken);
	    post.setConfig(Brower.getRequestConfig());
	    
		StringEntity json2 = new StringEntity(str ,ContentType.APPLICATION_JSON);
		post.setEntity(json2);
		
		cl = httpclient.execute(post,httpClientContext);
	    
	    this.cl = this.httpclient.execute(post, this.httpClientContext);
	    
	    if(cl.getStatusLine().getStatusCode()==200) {
			try
			{
				final JSONObject jsonObject = new JSONObject(EntityUtils.toString(this.cl.getEntity()));
				String errcode = jsonObject.get("errcode").toString();
				String errmsg = jsonObject.get("errmsg").toString();
				if("0".equals(errcode)) {
					System.out.println("msg push to user successfully");
				}
				else {
					System.out.println("failed to push the msg2 "+jsonObject.get("errmsg").toString());
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
	}
}
