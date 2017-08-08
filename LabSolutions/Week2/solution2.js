/*
Week 2 lab
*/

/*
1. First functions

    1. Implement “add", “even" and “odd" functions. (Basic functions)
    */
let add = (a,b) => {return a+b;};

// console.log(add(5,6))

let isEven = (n) => {return n % 2 == 0;};

// console.log(isEven(3));

let isOdd = (n) => {return Math.abs(n % 2) == 1;};

// console.log(isOdd(3));

/*
    2. Implement “generateRandomInteger" func that returns an integer between two bounds with defaults between 0 and 100. 
    // Use Math library and default params
*/

let generateRandomInteger = (min=0, max=100) => {
  return Math.floor(Math.random() * (max - min)) + min;
};
  
// console.log(generateRandomInteger(10,12));


/*
    3. Create an “inc” increment function so it can be called as inc(100)(2) with the first parameter as initial value (defaulted to 0) and second params as the step size (default to 1)  
    // Closure, nested function
    */

let inc = (init = 0) => {
  return (stepSize = 1) => {
    return init + stepSize};
};

// console.log(inc()());


/*
    4. A function “multiply" that accepts an arbitrary number of parameters
    */
let multiply = (...numbers) => {
  let product = 1;
  for (const number of numbers){
    product *= number;
  }
  return product;
};

let multiply2 = (...numbers) => {
  return numbers.reduce((a, b) => a * b, 1);
};

// console.log(multiply(1,2,3,4,5));
// console.log(multiply2(1,2,3,4,5));


/*
2. Object

  1. Create an object “vars” that contains
        * A constant value “universe" set to 42  // const
        * A variable “generateRandomArray" bound to an anonymous function that returns an array of random integers (use previous function) with the desired length as parameter (default to 50).   // function as value, arrow notation
        */

const universe = 42;
let generateRandomArray = (length=50) => [...new Array(length)].map(() => generateRandomInteger());

let vars = {universe,
           generateRandomArray
           };

// console.log(vars.generateRandomArray(12));


/*
3. A bit of functional programming
    1. Create a function “aboveUniverseAndEven” that returns a function that returns true is its input parameter is above the variable called “universe” and even (using your previous “even" function).
    */

let aboveUniverseAndEven = (n) => {
  return (universe = 42) => { 
    return universe < n && isEven(n)
  }
}

// console.log(aboveUniverseAndEven()())

/*
    2. Generate a random array named “results“ using “generateRandomArray" and filter the values using “aboveUniverseAndEven” without using an explicit loop. The result should be another smaller array with even values above 42.
    */

let results = generateRandomArray(10)
results = results.filter(number => aboveUniverseAndEven(number)(42))

// console.log(results)

/*
    3. Create a variable “resultsSquared” that squares all the values of results without an explicit loop.
    */

let resultsSquared = results.map(number => number*number);
// console.log(resultsSquared);

/*
    4. Sum “resultsSquared” without an explicit loop
    */
let sum = resultsSquared.reduce((a,b) => add(a,b), 0);
// console.log(resultsSquared);
// console.log(sum);