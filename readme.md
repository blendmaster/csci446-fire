# Fire!

A hand-drawn canvas port of Game & Watch's Fire, along with
a node.js-based file and high score persistence server. 
Written for my [CSCI 446](http://mines.humanoriented.com/446) class.

The server uses redis (barely) to persist the high scores, since
heroku doesn't support vanilla filesystem persistence that well.
