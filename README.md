## Realtime information system



#### Stackage installation[https://www.stackage.org/install#ubuntu]
sudo apt-get update
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:hvr/ghc
sudo apt-get update
sudo apt-get install -y cabal-install-1.20 ghc-7.8.4
cat >> ~/.bashrc <<EOF
export PATH=~/.cabal/bin:/opt/cabal/1.20/bin:/opt/ghc/7.8.4/bin:$PATH
EOF
export PATH=~/.cabal/bin:/opt/cabal/1.20/bin:/opt/ghc/7.8.4/bin:$PATH
cabal update
cabal install alex happy

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
