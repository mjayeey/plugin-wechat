package cn.mjayeey.confluence.api;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;

import org.json.JSONException;
import org.json.JSONObject;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class Http1GetToken {
	private CloseableHttpClient httpclient;
	private HttpClientContext httpClientContext;
	private CloseableHttpResponse cl;
	private String corpid;
	private String corpsecret;
	private String agentid;
	private String token;
	private boolean status = false;
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}

	public String setAgentid(String agentid) {	
		return agentid;
	}

	public String getAgentid() {	
		return agentid;
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
		Properties config = loadConfig();
    	this.corpid = config.getProperty("corpid");
    	this.corpsecret = config.getProperty("corpsecret");
		this.agentid = config.getProperty("agentid");
	}
	
	private Properties loadConfig() {
        Properties properties = new Properties();
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream("config.properties")) {
            if (inputStream == null) {
                throw new RuntimeException("Cannot find config.properties file");
            }
            properties.load(inputStream);
        } catch (IOException e) {
            throw new RuntimeException("Error loading config.properties file", e);
        }
        return properties;
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
