############################################################
## Author: Aditya Prasad                                  ##
## Date: Apr 22, 2016                                     ##
## Functionality: login, creates user, create portfolio   ##
## Usage: python cnupl.py                                 ##
############################################################

import logging
import selenium, time, uuid
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

driver = webdriver.Firefox()
driver.set_window_size(1400,800)
driver.get("https://beta.ccardemo.tech/")

x = uuid.uuid1()
x = str(x)
print(x)

def newuser(website):
    username = website.find_element_by_id("nickName")
    username.send_keys(x)
    username.send_keys(Keys.TAB)
    time.sleep(1)
    password = website.find_element_by_id("password")
    password.send_keys(x)
    password.send_keys(Keys.TAB)
    firstname = website.find_element_by_id("firstName")
    firstname.send_keys(str(time.ctime()))
    firstname.send_keys(Keys.TAB)
    lastname = website.find_element_by_id("lastName")
    lastname.send_keys(str(time.ctime()))
    registerbutton = website.find_element_by_id("registerInput")
    registerbutton.click()

def login(website):
    username = website.find_element_by_id("nickName")
    username.send_keys(x)
    username.send_keys(Keys.TAB)
    time.sleep(1)
    password = website.find_element_by_id("password")
    password.send_keys(x)
    password.send_keys(Keys.TAB)

def dropdown(website):
    time.sleep(3)
    allcompanies = website.find_element_by_id("abc")
    allcompanies.click()

def pickatab(website):
    time.sleep(3)
    portfoliotab = website.find_element_by_id("workbench-portfolio-tab")
    portfoliotab.click()
    portfoliotab.send_keys(Keys.TAB)
    time.sleep(1)
    portfolio = website.find_element_by_id("portfolioList")
    portfolio.click()
    portfolio.send_keys(Keys.DOWN)
    portfolio.send_keys(Keys.ENTER)
    time.sleep(2)    

def createnewportfolio(website):
    summary = website.find_element_by_id("portfolioSummary")
    summary.send_keys("New portfolio")
    saveportfolio = website.find_element_by_id("savePortfolio")
    saveportfolio.click()

def buysomestocks(website):
    stock = website.find_element_by_id("symbolID")
    stock.send_keys("aa")
    buyorsell = website.find_element_by_id("symbolSideID")
    buyorsell.send_keys(Keys.DOWN)
    symboltype = website.find_element_by_id("symbolTypeID")
    symboltype.send_keys(Keys.DOWN)
    symbolquantity = website.find_element_by_id("symbolQuantityID")
    symbolquantity.send_keys("100")
    savesymbolbutton = website.find_element_by_id("saveSymbol")
    savesymbolbutton.click()

if __name__ == "__main__":
    newuser(driver)
    dropdown(driver)
    pickatab(driver)
    createnewportfolio(driver)
    buysomestocks(driver)

    time.sleep(1)
    driver.get("https://beta.ccardemo.tech")
    time.sleep(1)

    login(driver)
    dropdown(driver)
    time.sleep(1)
    pickatab(driver)

    for x in range(0, 5000, 8):
        driver.execute_script("window.scrollTo(0," + str(x) + ")")
    time.sleep(5)

    driver.get("https://beta.ccardemo.tech/")

    time.sleep(1)

    driver.close()
