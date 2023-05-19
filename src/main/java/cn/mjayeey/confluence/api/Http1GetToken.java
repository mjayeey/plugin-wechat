package cn.mjayeey.confluence.api;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;

import org.json.JSONException;
import org.json.JSONObject;

public class Http1GetToken {
	private CloseableHttpClient httpclient;
	private HttpClientContext httpClientContext;
	private CloseableHttpResponse cl;
	private String corpid;
	private String corpsecret;
	private String token;
	private boolean status = false;
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}
	public boolean isStatus() {
		return status;
	}
	public void setStatus(boolean status) {
		this.status = status;
	}
	public Http1GetToken(CloseableHttpClient httpclient, HttpClientContext httpClientContext) {
		super();
		this.httpclient = httpclient;
		this.httpClientContext = httpClientContext;
		this.corpid = "ww0eb0e708ba43157b";
		this.corpsecret = "nLeOLlHrPwCgSaY54vkZ4YBS5j1CEqwcMcnTT4P3JdY";
		//this.corpid = "ww26587ae7040e6595";
		//this.corpsecret = "qZ1J-C6APavSd1GbXozFXSVIZ-21zKFF49DbhSHgA9w";
	}
	
	public void execute() throws Exception {
	    HttpGet get = new HttpGet("https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid="+corpid+"&corpsecret="+corpsecret);
	    get.setConfig(Brower.getRequestConfig());
	    this.cl = this.httpclient.execute(get, this.httpClientContext);
	    
	    if(cl.getStatusLine().getStatusCode()==200) {
			try
			{
				final JSONObject jsonObject = new JSONObject(EntityUtils.toString(this.cl.getEntity()));
				String errcode = jsonObject.get("errcode").toString();
				if("0".equals(errcode)) {
					status = true;
	    			this.token = (String)jsonObject.get("access_token").toString();
				}
			}
			catch (final JSONException e)
			{
				throw new RuntimeException("Requesting details of plugin with key" );
			}
	    }
	    else {
	    	EntityUtils.toString(this.cl.getEntity());
	    }
	    
	    cl.close();

	}
}
