from selenium import webdriver
from selenium.webdriver.common.keys import Keys

driver = webdriver.Firefox()
driver.get("https://ccar.demo.com")

def wrongpassword(website):
    user = website.find_element_by_id("nickName")
    user.send_keys("test")
    user.send_keys(Keys.TAB)
    time.sleep(5)
    password = website.find_element_by_id("password")
    for x in range(3):
        password.send_keys("wrongpassword")
        time.sleep(5)
