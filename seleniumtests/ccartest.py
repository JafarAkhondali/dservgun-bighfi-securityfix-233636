#!#/usr/bin/python

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time


driver = webdriver.Firefox()
time_wait = 5
driver.get("https://ccar.demo.com")

def login(website):
    user = website.find_element_by_id("nickName")
    user.send_keys("test")
    user.send_keys(Keys.TAB)
    time.sleep(time_wait)
    password = website.find_element_by_id("password")
    password.send_keys("test")
    password.send_keys(Keys.TAB)

def dropdown(website):
    time.sleep(time_wait)
    allcompanies = website.find_element_by_id("abc")
    allcompanies.click()

login(driver)
dropdown(driver)
