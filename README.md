## Realtime information system

#### Components
* Yesod server 
* Haxe client 
* Python plugin integrating with libreoffice

### Instructions
url: beta.ccardemo.tech

* Enter a user name (most likely that wont exist), please follow instructions, email need not be valid. The site doesnt validate that.
* Portfolio analysis lets a user create a portfolio.
* There is a chat window to type simple text.


#### Server features
* CCAR - Comprehensive Capital Analysis and Review is a specification to handle books of large financial organisations
this prototype presents an approach to manage the review documents using a description language. 
  ** A declarative language used to manage stress, curves etc.
  ** A query language to download equity and option as well as portfolio data.


#### Client features (haxe/web)
  * Display graphs as user uploads symbols
  * Realtime file upload 
  * Realtime chat 
  * Realtime stress computation - basic equity stress, prices change every n seconds 
  * Realtime market data: equity and option using tradier api.


#### Client features (python) 
  * Application data is loaded into a libreoffice spreadsheet. 
  * Users can use the spreadsheet as a regular spreadsheet, while connected to the server. 
  * Support for open id.
  * SSL support: uses a well known location to download public certificates. This may need to be revisited.


#### Notes
* Error handling needs work.
* Login checks for login as the user leaves the field. This check required me to have the check twice (need to look into that and see if that can be reduced). This clutters the code for the login.
* Tests need to improve to check for disconnects.
* Haskell realtime server uses TBQueue (this was after TChan blew up under specific load conditions)
* Parser errors need to be handled better : using parsec was great, though without QQ i couldnt test 
the parser inline (todo). 
* Custom serialization was monadic at some instances.
* Use aeson lenses for json to control the code.




#### [Stackage installation](https://www.stackage.org/install#ubuntu)
  * sudo apt-get update
  * sudo apt-get install -y software-properties-common
  * sudo add-apt-repository -y ppa:hvr/ghc
  * sudo apt-get update
  * sudo apt-get install -y cabal-install-1.20 ghc-7.8.4
  * cat >> ~/.bashrc <<EOF
  * export PATH=~/.cabal/bin:/opt/cabal/1.20/bin:/opt/ghc/7.8.4/bin:$PATH
  * EOF
  * cabal update
  * cabal install alex happy

#### Beta. 



* haxe : 3.0.0

* Haxe Libraries:
* mlib: [2.0.2]
* munit: [2.1.0]
* mconsole: [1.6.0]
* promhx: [1.0.16]
* hamcrest: [1.2.1]
* mcover: [2.1.1]



Installation using stack
======================================
wget -q -O- https://s3.amazonaws.com/download.fpcomplete.com/ubuntu/fpco.key | sudo apt-key add -
echo 'deb http://download.fpcomplete.com/ubuntu/precise stable main'|sudo tee /etc/apt/sources.list.d/fpco.list
echo 'deb http://download.fpcomplete.com/ubuntu/trusty stable main'|sudo tee /etc/apt/sources.list.d/fpco.list
sudo apt-get update && sudo apt-get install stack -y


Some admin commmands
====================================
sudo -u postgres psql -d <dbname>

Restart postgres
===================================
/etc/init.d/postgresql restart

Login as root
kill -QUIT $(cat /usr/local/nginx/logs/nginx.pid)
#Starting stunnel if installed:
root@koala:/etc/stunnel# /etc/init.d/stunnel4 restart

Self signing certificates
  Url [https://www.digitalocean.com/community/tutorials/how-to-set-up-an-ssl-tunnel-using-stunnel-on-ubuntu]
  openssl genrsa -out /etc/stunnel/key.pem 4096
  openssl req -new -x509 -key /etc/stunnel/key.pem -out /etc/stunnel/cert.pem -days 1826

To find out which version of ubuntu I am running
 lsb_release -a 

Restart nginx
======================================
sudo service nginx restart
