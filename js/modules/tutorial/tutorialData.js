/* filepath: /js/modules/tutorial/tutorialData.js */
export const tutorialTasks = [
  {
    title: "Foundation: Understanding Turtle Graphics",
    description:
      "Learn the basics by seeing how turtle graphics works, then practice independently.",
    type: "foundation",
    aiAllowed: false,
    completed: false,
    estimatedTime: "8-10 minutes",
    steps: [
      {
        instruction:
          "Study this Python turtle graphics example that draws a square with sides of length 50.",
        code: `import turtle
t = turtle.Turtle()
t.forward(50)
t.right(90)
t.forward(50)
t.right(90)
t.forward(50)
t.right(90)
t.forward(50)
t.right(90)`,
        hint: "This shows the basic turtle commands. Notice how each side is drawn separately.",
        tip: "Understanding this foundation will help you with all future tasks.",
        type: "demonstration",
      },
      {
        instruction:
          "Write Python code using turtle graphics to draw an equilateral triangle with sides of length 50.",
        code: "# Try drawing a triangle using turtle commands\n# Hint: A triangle has 3 sides and turns 120 degrees",
        hint: "A triangle has 3 sides. Each turn should be `120` degrees (`360° ÷ 3`).",
        tip: "Use `forward()` and `right()` commands like in the square example.",
        type: "solo_practice",
        expectedOutput: "Triangle shape",
        aiBlocked: true,
      },
    ],
  },
  {
    title: "Planning: Design Your House",
    description:
      "Think through your approach before coding by planning on paper.",
    type: "planning",
    completed: false,
    estimatedTime: "5 minutes",
    steps: [
      {
        instruction:
          "Sketch a plan on paper for drawing a simple house with a square base and triangle roof using turtle graphics",
        code: "# No coding yet - use physical paper and pen",
        hint: "Think about: What shapes do you need? In what order? What turtle commands?",
        tip: "Good planning makes coding much easier!",
        type: "pen_and_paper",
        questions: [
          "What shapes make up a house?",
          "In what order should you draw them?",
          "How will you position the triangle on top of the square?",
          "What turtle commands will you need?",
        ],
      },
    ],
  },
  {
    title: "Task 1: Draw a House with Functions",
    description:
      "Create a simple house using functions for procedural programming.",
    type: "procedural_programming",
    aiAllowed: true,
    completed: false,
    estimatedTime: "15-20 minutes",
    paradigm: "procedural",
    steps: [
      {
        instruction:
          "Write a Python function draw_square(t, size) that uses turtle graphics to draw a square with sides of length 'size'",
        code: `import turtle

def draw_square(t, size):
    # Write code to draw a square of given size
    pass

# Test your function
t = turtle.Turtle()
draw_square(t, 50)`,
        hint: "Functions let you reuse code. Use a for loop: `for i in range(4):`",
        tip: "The function should take a turtle object and size as parameters.",
        requirements: ["Function definition", "Parameters", "Square drawing"],
        type: "function_creation",
      },
      {
        instruction:
          "Write a Python function draw_triangle(t, size) that uses turtle graphics to draw an equilateral triangle with sides of length 'size'",
        code: `
def draw_triangle(t, size):
    # Write code to draw a triangle of given size
    pass

# Test your triangle function  
draw_triangle(t, 50)`,
        preserveCode: true,
        appendCode: true,
        hint: "Triangles have 3 sides and use 120-degree turns.",
        tip: "Add this function below your existing draw_square function.",
        requirements: [
          "Triangle function",
          "120-degree turns",
          "Size parameter",
        ],
        type: "function_creation",
      },
      {
        instruction:
          "Write a Python function draw_house(t, size) that uses your draw_square and draw_triangle functions to draw a house with a square base and triangle roof",
        code: `
def draw_house(t, size):
    # Draw square base using draw_square function
    # Position turtle and draw triangle roof using draw_triangle function
    pass

# Test your house function
t.clear()
draw_house(t, 80)`,
        preserveCode: true,
        appendCode: true,
        hint: "Call both `draw_square` and `draw_triangle` functions. Position the triangle on top.",
        tip: "Use `t.penup()`, `t.forward()`, `t.pendown()` to move between shapes.",
        requirements: [
          "Uses both functions",
          "Proper positioning",
          "Complete house",
        ],
        type: "composition",
      },
      {
        instruction:
          "Enhance your house by adding functions to draw a door and window using turtle graphics",
        code: `# Optional: Add door/window functions below
def draw_door(t, size):
    # Optional: draw a simple door
    pass

def draw_window(t, size):
    # Optional: draw a simple window
    pass

# Optional: Modify your draw_house function to include door/window
# draw_house(t, 50, include_door=True)`,
        hint: "This is optional. A door could be a small rectangle, a window could be a small square.",
        tip: "Only do this if you've completed the basic house and have extra time.",
        requirements: ["Optional extension", "Simple shapes"],
        type: "optional_extension",
        optional: true,
        preserveCode: true,
        appendCode: true,
      },
    ],
  },
  {
    title: "Task 2: Create a House Class",
    description:
      "Build reusable House objects using object-oriented programming.",
    type: "object_oriented_programming",
    aiAllowed: true,
    completed: false,
    estimatedTime: "15-20 minutes",
    paradigm: "object_oriented",
    steps: [
      {
        instruction:
          "Create a Python House class with an __init__ method that accepts size, x and y position parameters",
        code: `import turtle

class House:
    def __init__(self, size, x=0, y=0):
        self.size = size
        self.x = x
        self.y = y
        self.turtle = turtle.Turtle()
        
    # Add methods below`,
        hint: "Classes bundle data (size, position) with methods (actions).",
        tip: "The `__init__` method runs when you create a new House object.",
        requirements: ["Class definition", "Constructor", "Instance variables"],
        type: "class_definition",
        preserveCode: true,
        resetCode: true, // Start fresh for new paradigm
      },
      {
        instruction:
          "Add a draw_base method to the House class that draws a square at the house's position with the specified size",
        code: `
    def draw_base(self):
        # Move turtle to position and draw square base
        # Use self.size, self.x, self.y
        pass`,
        hint: "Use `self.turtle.goto(self.x, self.y)` to position, then draw the square.",
        tip: "Add this method inside your House class.",
        requirements: [
          "Method definition",
          "Uses self attributes",
          "Draws square",
        ],
        type: "method_implementation",
        preserveCode: true,
        appendCode: true,
      },
      {
        instruction:
          "Add a draw_roof method to the House class that draws a triangle on top of the square base",
        code: `    def draw_roof(self):
        # Position turtle and draw triangle roof on top of base
        pass`,
        hint: "Calculate roof position based on `self.x`, `self.y`, and `self.size`.",
        tip: "Add this method after your draw_base method.",
        requirements: ["Roof method", "Proper positioning", "Triangle shape"],
        type: "method_implementation",
        preserveCode: true,
        appendCode: true,
      },
      {
        instruction:
          "Add a draw method to the House class that calls draw_base and draw_roof, then create and draw 3 different house instances",
        code: `    def draw(self):
        # Draw the complete house (base + roof)
        self.draw_base()
        self.draw_roof()

# Create at least 3 different houses
house1 = House(60, -150, 0)
house1.draw()

house2 = House(80, 0, 0)  
house2.draw()

house3 = House(50, 150, 0)
house3.draw()`,
        hint: "The draw method coordinates drawing the entire house.",
        tip: "Add the draw method, then create multiple house instances to test.",
        requirements: [
          "Complete draw method",
          "At least 3 houses",
          "Different sizes/positions",
        ],
        type: "method_coordination",
        preserveCode: true,
        appendCode: true,
      },
      {
        instruction:
          "Enhance your House class by adding color support and methods to draw doors and windows",
        code: `# Optional enhancements - add anywhere in your code:
# - Add color parameter to __init__ and use in drawing
# - Add door/window methods
# - Try different house styles

# Example:
# house4 = House(90, 0, -100, color='blue')
# house4.draw()`,
        hint: "This is optional. Try adding a color parameter or simple door/window features.",
        tip: "Modify your existing class or add new features as you see fit.",
        requirements: ["Optional extension", "Creative additions"],
        type: "optional_extension",
        optional: true,
        preserveCode: true,
        appendCode: true,
      },
    ],
  },
];

// Helper function to get task metadata
export function getTaskMetadata(task) {
  return {
    type: task.type,
    paradigm: task.paradigm || "none",
    aiAllowed: task.aiAllowed,
    estimatedTime: task.estimatedTime,
    requirements: task.steps.flatMap((step) => step.requirements || []),
    hasOptionalSteps: task.steps.some((step) => step.optional),
  };
}
