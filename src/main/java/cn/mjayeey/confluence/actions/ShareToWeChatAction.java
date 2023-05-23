package cn.mjayeey.confluence.actions;

import com.atlassian.confluence.core.ConfluenceActionSupport;
import com.atlassian.confluence.pages.Page;
import com.atlassian.confluence.pages.PageManager;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.client.protocol.HttpClientContext;
import com.atlassian.confluence.pages.actions.PageAware;
import com.atlassian.confluence.pages.AbstractPage;
import com.atlassian.confluence.util.GeneralUtil;
import com.atlassian.confluence.pages.Attachment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.List;
import java.util.ArrayList;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import cn.mjayeey.confluence.api.Brower;
import cn.mjayeey.confluence.api.SendMsg;


public class ShareToWeChatAction extends ConfluenceActionSupport implements PageAware {
    private static final Logger  LOGGER = LoggerFactory.getLogger(ShareToWeChatAction.class);

	private AbstractPage page;

    public ShareToWeChatAction() {

    }

    @Override
    public String execute() {
        LOGGER.info("ShareToWeChatAction1111111");
        // 获取title
        String pageTitle = page.getTitle();
		// 获取页面 URL 的路径部分
		String urlPath = page.getUrlPath();
		// 构建完整的页面 URL
		String baseUrl = GeneralUtil.getGlobalSettings().getBaseUrl();
		String fullUrl = baseUrl + urlPath;
		String pageContent = page.getBodyAsString();

		// 在页面内容中查找所有标题
		Pattern pattern = Pattern.compile("<h\\d>[^<]+</h\\d>");
		Matcher matcher = pattern.matcher(pageContent);

        // 第一张图片
		String filename = getFilenameFromImageTag(pageContent);
		List<Attachment> attachments = page.getAttachments();
		String imageUrl = "";
        String imageName = "";
		String attachmentName = "";
		byte[] data;
		Attachment attachment2 = null;
		for (Attachment attachment : attachments) {
			String contentType = attachment.getContentType();
			attachmentName = attachment.getFileName();
			if (contentType != null && contentType.startsWith("image/")) {
				if (attachment.getFileName().equalsIgnoreCase(filename)) {
					attachment2 = attachment;
					break;
				}
			}
		}

        CloseableHttpClient httpclient = Brower.getCloseableHttpClient();
        HttpClientContext httpClientContext = Brower.getHttpClientContext();
        SendMsg msg = new SendMsg(httpclient, httpClientContext);
        msg.execute(pageTitle, fullUrl, pageContent, attachment2);
        
        return SUCCESS;
    }

	public String getFilenameFromImageTag(String content) {
		if (content != null) {
			int startIndex = content.indexOf("filename=\"");
			if (startIndex >= 0) {
				startIndex += "filename=\"".length();
				int endIndex = content.indexOf("\"", startIndex);
				if (endIndex >= 0) {
					return content.substring(startIndex, endIndex);
				}
			}
		}
		return "";
	}

	@Override
	public AbstractPage getPage() {
		return page;
	}

	@Override
	public void setPage(AbstractPage page) {
		this.page = page;

	}

    @Override
	public boolean isLatestVersionRequired() {
		return true;
	}

	@Override
	public boolean isPageRequired() {
		return true;
	}

	@Override
	public boolean isViewPermissionRequired() {
		return false;
	}
}