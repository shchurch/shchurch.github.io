docker run --rm -it -v "$PWD:/srv/jekyll" -p 4001:4000 jekyll/jekyll:pages /bin/bash\n
bundle install
bundle exec jekyll serve --host 0.0.0.0