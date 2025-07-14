# A Playful Introduction to Programming with Python

This activity is meant to be very informal and playful, its aim is to give you a very brief introduction to programming in the python programming language, by simply modifying and extending some example code. 

The hope is to show you that learning programming can be easy and fun, and to motivate you to go and learn more.

## Turtle Graphics.

Now you will start an exercise using Python, and in particular a very simple feature of Python, which is the [turtle module](https://docs.python.org/3/library/turtle.html), or "turtle graphics". This is a tool originally designed to introduce programming to children. So it may feel a bit childish, but hopefully it will also be fun.

> Turtle graphics is a popular way for introducing programming to kids. It was part of the original Logo programming language developed by Wally Feurzig and Seymour Papert in 1966.

> Imagine a robotic turtle starting at (0, 0) in the x-y plane. After an `import turtle`, give it the command `turtle.forward(15)`, and it moves (on-screen!) 15 pixels in the direction it is facing, drawing a line as it moves. Give it the command `turtle.right(25)`, and it rotates in-place 25 degrees clockwise.

> By combining together these and similar commands, intricate shapes and pictures can easily be drawn.

(from the [official documentation](https://docs.python.org/3/library/turtle.html?highlight=turtle#turtle.filling"))

As an aside, if you are curious about this work you can find more information in the [Mindstorms book](https://ucl-new-primo.hosted.exlibrisgroup.com/primo-explore/fulldisplay?docid=UCL_LMS_DS21155744360004761&context=L&vid=UCL_VU2&search_scope=CSCOP_UCL&isFrbr=true&tab=local&lang=en_US), and on [an old TV documentary](https://www.youtube.com/watch?v=Ni_chb70xtc).

In reality, I would not expect anyone to prototype visualizations using the turtle. This is just a playful example to start thinking in terms of programming and graphics.

## Tools

Please complete the exercise with the tool provided: [https://vibe-bphahmfzbfc8h0c7.westeurope-01.azurewebsites.net/](https://vibe-bphahmfzbfc8h0c7.westeurope-01.azurewebsites.net/)

## Getting started
To get started, please copy and paste this code on [skulpt.org](http://www.skulpt.org/) and run it by clicking on the "Run" button.

```python
import turtle

turtle.forward(40)
turtle.left(90)
turtle.forward(40)
turtle.left(90)
turtle.forward(40)
turtle.left(90)
turtle.forward(40)
turtle.left(90)

turtle.done()
```

The turtle objects has quite a lot of 'methods', they are all listed in the [official online documentation](https://docs.python.org/3/library/turtle.html?highlight=turtle#turtle-methods).

However, you should be able to go through these exercises using just the following commands:

* [forward(distance)](https://docs.python.org/3/library/turtle.html?highlight=turtle#turtle.forward)
* [left(angle)](https://docs.python.org/3/library/turtle.html?highlight=turtle#turtle.left)
* [penup()](https://docs.python.org/3/library/turtle.html?highlight=turtle#turtle.penup)
* [pendown()](https://docs.python.org/3/library/turtle.html?highlight=turtle#turtle.pendown)

`forward` and and `left` are demonstrated to you on the example above. `penup` and `pendown` are needed to be able to move the turtle without drawing (as you might have guessed, the turtle starts with the pen down).

If you want to optionally try something a little more fancy, you may try using also these:

* [begin_fill()](https://docs.python.org/3/library/turtle.html#turtle.begin_fill)
* [end_fill()](https://docs.python.org/3/library/turtle.html#turtle.end_fill)

and then you could even try to add labels using:

* [write(arg)](https://docs.python.org/3/library/turtle.html#turtle.write)

## Draw a Triangle
The next step involve using turtle to create a triangle, how should you do it?

## Continue with paper.

The next step involve using turtle to create bars charts, but before doing that let's start on paper. As a playful activity, but more importantly to get you started with thinking about the details of making charts, please have a go at creating some simple charts using just paper and a pen or pencil or the paint software on Windows.

1. To start with, please create a simple bar chart for the following values: **[6, 9, 10, 7, 4]**
1. Then, represent the same data in terms of area
   
After you have succssfully finish the drawing, please stop reading here and using the python turtle with the help of the ai assistant to try to 

1. Modify the square example to create a simple bar chart for the following values: **[6, 9, 10, 7, 4]**
1. Then, represent the same data in terms of area

After you have created a basic version of the two charts, then continue reading. The rest of this tutorial will introduce, or remind you of some other fundamental concepts in programming.


## Loops & Lists.

One very simple, yet very powerful trick with programming is repeating things. In Python a "for loop" can be used to easily repeat things. For example, to draw a square we could use:

```python
for i in range(4):
    turtle.forward(40)
    turtle.left(90)
```
(if you are wondering what `i` is, please read on)

or to draw a decagon:

```python
for i in range(10):
    turtle.forward(40)
    turtle.left(36)
```

Please try this example, and all of the following ones, to see what they do. Here is what it should look like when you run it: 
![Decagon example](https://gist.github.com/ecostanza/a03333bd303ec059ecf531c28a83ea21/raw/decagon.png)


We can also use a _variable_ `n` to define how many times we repeat, and use that same value to calculate the angle we want to turn:

```python
n = 10
for i in range(n):
    turtle.forward(40)
    turtle.left(360/n)
    # please note that if you want to
    # try and run this in some older 
    # versions of python you may need
    # to write '360.0' rather than '360' 
    # otherwise python may round the 
    # result of the division in an 
    # inconvenient way
    # by the way lines starting with '#' are comments, 
    # i.e. lines that are ignored by python
    # but can make the code more readable
```

I'd be surprised if anyone never heard of the term 'variable' before - even if so, hopefully the example above gives you intuition that a variable in python is roughly similar to a simple "data container."
You can "store" a value into the variable using `=` as shown above.

Here is an example of 'nested' repetition, where we use `for` to iterate over values contained in a list (the list is the bit inside `[` and `]`):

```python
for n in [3, 4, 5, 6, 7, 8, 9, 10]:
    for i in range(n):
        turtle.forward(40)
        turtle.left(360/n)
```

Here is what it should look like when you run it: 
![Nested example](https://gist.github.com/ecostanza/a03333bd303ec059ecf531c28a83ea21/raw/nested.png)

### More about `for` and indentation
If you are new to programming, it might be useful to reflect a little more about the `for` loop. The word right after `for` is a _variable_, and you can name it however you want. Some of the examples above use `i` some use `n`; `value` would also be a valid name. 

The lines of code under the `for` instruction are indented. These indented lines are known as the "_body_" of the for loop, and they are repeated as many times as the items in the list in the `for` instruction (technically it can be a sequence, a list is a type of sequence, but there are also other types of sequences..). At every repetition, or 'iteration', the variable is assigned the corresponding value of the sequece (i.e. for the example above, in the first iteration `n=3`, in the second `n=4`, etc..). 

_Line indentation_ plays an important role in Python, as it is used to define what is contained inside the for loop, and what is out.

Note also that `range()` which is used in the earlier examples is a built-in python function that generates a sequence of numbers. So `for i in range(4):` is _roughly_ equivalent to `for i in [0, 1, 2, 3]:`.



## Functions
Functions are one of the fundamental and most powerful concepts in programming. Hopefully you have been introduced to this concept before, but just in case, here is one example of how a simple function is defined in python:

```python
def draw_polygon(n_sides):
    for i in range(n_sides):
    	turtle.forward(40)
    	turtle.left(360.0/n_sides)
    return
```

Note that again line indentation is used to define what is inside the function, also known as the body of the function. `n_sides` is an "_argument_" of the function, and you can think of it as a variable. Similar to the `for` loop, you could use different names for the arguments. 

Once you have **def**ined this function you should be able to use 
`draw_polygon(4)` to draw a square, `draw_polygon(5)` to draw a pentagon, and so on.. For example:

```python
def draw_polygon(n_sides):
    for i in range(n_sides):
    	turtle.forward(40)
    	turtle.left(360.0/n_sides)
    return

# let's call the function
draw_polygon(4)
draw_polygon(5)
```

In simple terms, a function is "a piece of code that can be reused." A function can receive data as input (in the example above `n_sides` indicating the number of sides of the polygon), and it can *return* data as output. It can be useful to think of a function in terms of a block diagram:

![Function diagram](https://gist.github.com/ecostanza/a03333bd303ec059ecf531c28a83ea21/raw/function_diagram.png)

Please note that "no data" is also a valid option. Indeed in the example above the `draw_polygon` function returns no data. In a block diagram, the `draw_polygon` function could be shown like this: 

![draw_polygon diagram](https://gist.github.com/ecostanza/a03333bd303ec059ecf531c28a83ea21/raw/draw_polygon_diagram.png)

A simple example of a function that has both input and output could be a function to add two values:

```python
def add(x, y):
    return x + y
```

Such a function could then be *called* as follows, storing the result in a variable:

```python
some_variable = add(10, 2)
```

In a block diagram, the `add` function could be shown like this: 

![add diagram](https://gist.github.com/ecostanza/a03333bd303ec059ecf531c28a83ea21/raw/add_diagram.png)

There can also be functions that take *no data* as input, and produce some data as output. One example could be a hypothetical function `read_sensor` to read values from a sensor:

![read_sensor diagram](https://gist.github.com/ecostanza/a03333bd303ec059ecf531c28a83ea21/raw/read_sensor_diagram.png)

If it helps you, you might think of a function as a "system," that when activated (i.e. when the function is called) does something. 


- - - - 
__Task.__ Please have a go at rewriting your code for drawing the charts using functions, loops and lists (if you haven't already!).

In particular, try to create a function to draw the key elements of the charts, for example each bar.
One option is to start from the `draw_polygon` function above, and modify it into a `draw_bar` function. Let this `draw_bar` take as argument the height of the bar that you want to draw, e.g. `def draw_bar(height)`. 

From your prior experience with drawing bars you should know that after drawing the bar you need to move to where the next bar is drawn. It is equally valid to have the code to move to the next bar inside or outside the function.

Once you get the code to draw all 5 bars written through repeated calls to the `draw_bar` function, it should hopefully be easy to see how to modify the code to use a for loop, and use a list to store the numbers that you need to plot, something like:

```python
data = [6, 9, 10, 7, 4]
```

Then you can iterate over this list as follows:
```python
data = [6, 9, 10, 7, 4]
for value in data:
    # you need to do something with value here..
```

 

- - - -

## Objects, Methods and Classes

Another basic python concept that you need to be aware of is an *object*. The `turtle` you have been using so far is indeed an object, so you already know how to use an object..

An object is a collection of variables (i.e. data) and functions. Functions contained in an object are called __methods__. For example, `forward` and `left` are methods of the turtle object. What variables or data is in a `turtle` object? The `turtle` needs to know its own position (in terms of x and y coordinates), orientation (i.e. what direction it is facing) and whether the pen is up or down.

Methods generally manipulate the data contained in the object. In other words, the object data can be used as both input and output of the object methods. It can be useful to think about in terms of a block diagram:

![method diagram](https://gist.githubusercontent.com/ecostanza/a03333bd303ec059ecf531c28a83ea21/raw/4ddf1b0bc79a5b1bc0590270f2845416d19265d9/method_diagram.png)

For example, the `turtle.forward` method receives as input the number of 'steps' (i.e. pixels) we want the object to move forward, but it also uses the orientation of the turtle to calculate in which direction to move, and it updates the object position. 

Hopefully these concepts will become clearer through an example. Let's define a simple object to represent a square. In Python we can define a new type of object using the keyword class:

```python
class Square:
    size = 40

    def draw(self):
        for i in range(4):
            turtle.forward(self.size)
            turtle.left(90)
```

Having defined the class (i.e. "object type") Square, we can create a new object of that type, and use its only method:

```python            
s = Square()
s.draw()
```

Please note that it is conventional in Python to use capital letters to start the name of a class.
When you try this in skulpt.org, you should see the following:
![square class example](https://gist.github.com/ecostanza/a03333bd303ec059ecf531c28a83ea21/raw/square_class.png)

Note that the `square.draw` method does not take any external input, but it needs the `self` input to be able to access the object data (in this case the size).

Let's now add a `scale` method that takes external input:
```python
class Square:
    size = 40

    def draw(self):
        for i in range(4):
            turtle.forward(self.size)
            turtle.left(90)
    
    def scale(self, factor):
        self.size = self.size * factor
```

Here is an example of how to use it:

```python
class Square:
    size = 40

    def draw(self):
        for i in range(4):
            turtle.forward(self.size)
            turtle.left(90)
    
    def scale(self, factor):
        self.size = self.size * factor

s = Square()
s.draw()
s.scale(2)
s.draw()
```

Let's consider some of the details of this example:

### Size (object member variable)
The `Square` object contains one single piece of data, i.e. just one variable: `size`, which represents the size of the square in pixels. When the object is created, this size variable is set to `40` (through the line `size = 40`).

### Factor (method argument)
`factor` is the external input to the scale function (similar to how `n_sides` is the input to the `draw_polygon` function we saw earlier). `factor` indicates by how much we want to scale the square. In the example above we call `s.scale(2)` to make the square _two_ times bigger, `s.scale(3)` would make the square _three_ times bigger.

### self
`self` is a special variable name which is _used to refer to an object from "inside the object itself"_  (to be more precise, self is used to refer to object within the object type definition, i.e. the class). Let's think about this in relation to the example above.

The method `scale` is part of the `Square` object, so we can think of it as being "inside the object." When we want to access the object's `size` variable from within the scale function we can use `self`.

In contrast, starting from the line `s = square()` we are "outside the object" -- this line creates an object of type `Square`, and it stores it in a variable called `s`.
So now we use `s` to refer to this object, i.e. to use it. So in this case if we want to access the data or methods of the object we use `s`.

Let's go back to the `scale` function, inside the class (i.e. inside the definition of the object). When we define the methods of the class, we _have to_ use the special variable `self` as the first item in the methods input, so that the methods can access the object.


### Methods creating new objects and method chaining
In the example above the `scale` method changes the state of the `Square` object, specifically it changes its `size`. An alternative approach that is commonly used is instead to keep the original object as it is, but to let the scale method return a new object with scaled size.
This approach is used often in Python (e.g. in libraries like Pandas), so it is important to get used to it. Example:

```python
class Square:
    size = 40

    def draw(self):
        for i in range(4):
            turtle.forward(self.size)
            turtle.left(90)
    
    def scale(self, factor):
        new_square = Square()
        new_square.size = self.size * factor
        return new_square
```

Note that now if we run:

```python
s = Square()
s.draw()
s.scale(2)
s.draw()
```
we will draw two squares of the same size on top of each other (because `s` is not affected by scale). 
Instead, one way to use the new method is to create a new variable for the second, scaled square:
```python
s1 = Square()
s1.draw()
s2 = s1.scale(2)
s2.draw()
```

However, there is also a more compact way to do that, known as "method chaining" (method chaining is often used in libraries and examples, so it's important that you get used to it):

```python
s = Square()
s.draw()
s.scale(2).draw()
```

Note that it is possible to use method chaining even without creating a new object. To make that work, we need to return `self` from the original scale function:

```python
class Square:
    size = 40

    def draw(self):
        for i in range(4):
            turtle.forward(self.size)
            turtle.left(90)
    
    def scale(self, factor):
        self.size = self.size * factor
        return self

s = Square()
s.draw()
s.scale(2).draw()
```


- - - - 
__Task.__ To further understand the ideas of objects, class and methods, please have a go at rewriting your code for drawing the charts using at least one class (if you haven't already..).

For example, you could start from the `Square` class/object example above and try to modify it to make it into a Bar or Rectangle. There are many valid ways to do this, for example:

- you could add a variable inside the object, so that one variable stores the width and one the height of the bar, and then modify the draw method accordingly.

- Another option would be to keep just one object variable to represent the width (or thickness of the bar) and then modify the draw method to receive an external input to represent the height.
- - - - 

### Procrastination

By the way, if you are intrigued by computer generated drawing (and more in general computer generated art), there is a lot of beautiful work, pioneers include [Vera Molnár](https://en.wikipedia.org/wiki/Vera_Moln%C3%A1r), [Georg Nees](http://www.heikewerner.com/nees_en.html), [A. Michael Noll](https://en.wikipedia.org/wiki/A._Michael_Noll), and [Frieder Nake](https://collections.vam.ac.uk/name/nake-frieder/A21853/). Moreover, much of the work by [Sol LeWitt](https://en.wikipedia.org/wiki/Sol_LeWitt) is [algorithmic in nature](https://www.sollewittprints.org/artwork/lewitt-raisonne-1971-18/). There are sometimes exhibitions about computer generated art in London, a [brilliant one](https://www.vam.ac.uk/exhibitions/chance-and-control-art-in-the-age-of-computers) was at the V&A in 2018 (and [another one in a private gallery](https://www.mayorgallery.com/exhibitions/531/overview/)). If you need a source of [procrastination](https://trinket.io/python/ae4b50b937), you could try to reproduce some of these works through your own code.

![Creative Commons Licence: Attribution-NonCommercial-ShareAlike](https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png)
This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
