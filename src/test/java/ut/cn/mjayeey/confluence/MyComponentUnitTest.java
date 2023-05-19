package ut.cn.mjayeey.confluence;

import org.junit.Test;
import cn.mjayeey.confluence.api.MyPluginComponent;
import cn.mjayeey.confluence.impl.MyPluginComponentImpl;

import static org.junit.Assert.assertEquals;

public class MyComponentUnitTest
{
    @Test
    public void testMyName()
    {
        MyPluginComponent component = new MyPluginComponentImpl(null);
        assertEquals("names do not match!", "myComponent",component.getName());
    }
}