from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time


driver = webdriver.Firefox()

driver.get("https://ccar.demo.com")

def login(website):
    user = driver.find_element_by_id("nickName")
    user.send_keys("test")
    user.send_keys(Keys.TAB)
    time.sleep(1)
    password = driver.find_element_by_id("password")
    password.send_keys("test")
    password.send_keys(Keys.TAB)


login(driver)
