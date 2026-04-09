/*
Nicolas Casillas
Actividad Uso de JavaScript
26/03/26
*/
"use strict";
function firstNonRepeating(string){
    if(!string) return undefined; //If its an empty string it returns null
    let count = {}; //create the array that will contain the char and its count
    for(let char of string){ //loop to go through every char of the string
        count[char] = (count[char] || 0) +1; //Adds 1 to the count
    }
    for (let char of string){//Loop again to check which one only appears once
        if(count[char] === 1){ //If its count is only 1, return it
            return char;
        }
    }
}
function bubbleSort(array){
    let n = array.length;
    for(let i = 0; i<n - 1;i++){ //loop to iterate through all the array
        for(let j = 0; j<n - i - 1;j++){ //loops until it reaches the first for iteration
            if(array[j]>array[j+1]){ //Swap if the current value is higher than the next one
                let temp = array[j];
                array[j] = array[j+1];
                array[j+1] = temp;
            }
        }
    }
    return array;//return array after finishing the loops

}
function invertArray(array){
    let result = []; //create an array where we will push the values front to back
    for (let i=array.length - 1;i>=0;i--){ //go through all the array front to back
        result.push(array[i]); //push the values to the new one
    }
    return result;
}
function invertArrayInplace(array){
    let left = 0; //variable to indicate the left side of the array
    let right = array.length - 1; //variable to indicate the right side of the array
    while(left<right){ //loop until the left side and the right side cross
        let temp = array[left]; //swap the left side value with the right side value
        array[left] = array[right];
        array[right] = temp;
        left++;
        right--;
    }
    return array;
}
function capitalize(string){
    if(!string) return ""; //empty string case
    let words = string.split(" ") //split every word and converts to an array
    let result = ""; //string we will be adding the complete and capitalized words
    for(let i = 0; i<words.length;i++){ //go through each word
        let word = words[i];
        if(word.length > 0){
            result += word[0].toUpperCase() + word.slice(1); 
            //capitalize only the first letter and split the rest of the word to join
        }
        if(i < words.length - 1){
            result += " "; //add spaces between words but not at the end of the string
        }

    }
    return result
}
function mcd(num1,num2){
    while(num2!==0){ // loop until we reach 0 in num2
        let temp = num2;
        num2 = num1%num2; //num2 keeps the rest of the division num1/num2 to check if divisible
        num1=temp;
    }
    return num1;
}
function hackerSpeak(string){
    let map = {'a':'4','e':'3','i':'1','o':'0','s':'5'};//map the changes with its respective letter
    let result = ""; //create the string we will be updating
    for(let char of string){ //go through all the chars of the string
        let lower = char.toLowerCase(); //convert the word to lowercase to compare in the map
        result += map[lower] || char; //if the letter is in the map, change it
    }
    return result;
}
function factorize(num){
    let factors =[]; //array to receive the values
    for(let i = 1;i<=num; i++){ //loop until the number is reached
        if(num % i === 0){ //if the number is divisible by i, push i
            factors.push(i);
        }
    }
    return factors
}
function deduplicate(array){
    let result = []; //create array to receive the values
    for(let item of array){ //go through the complete array
        if(!result.includes(item)){ //if you havent added the value, push it
            result.push(item);
        }
    }
    return result;
}
function findShortestString(array){
    if(array.length === 0) return 0; //return an empty array
    let min = array[0].length; //start minimum with the first value of the array to compare
    for (let str of array){
        if(str.length < min){ //compare and change if its shorter
            min = str.length;
        }
    }
    return min;
}
function isPalindrome(string){
    //first convert it in an array with letters, then reverse it and join it into a string again
    let reversed = string.split("").reverse().join("");
    if(string === reversed){ //compare if the strings are equal
        return true;
    } else{
        return false;
    }
}
function sortStrings(array){
    return bubbleSort(array); //reuse the bubble sort function to sort the strings
}
function stats(array){
    if(array.length === 0) return [0,0]; //if empty array
    let sum = 0;
    for (let i = 0;i<array.length;i++){ //loop for the total sum
        sum += array[i]; 
    }
    let avg = sum / array.length; // calculate average

    let freq = {};
    let max = 0;
    let moda = array[0];
    for(let i=0; i<array.length;i++){ //go through the array
        let num = array[i];
        freq[num] = (freq[num] || 0)+1; //count the times the number has appeared
        if (freq[num] > max){ //compare the highest count
            max = freq[num]; 
            moda = num; //store the number with highest count
        }
    }
    return [avg,moda];
}
function popularString(array){ //same procedure as last function mode but handling arrays
    if(array.length === 0) return ''; //empty array
    let freq = {};
    let max = 0;
    let result = array[0];
    for(let str of array){
        freq[str] = (freq[str] || 0) +1;
        if(freq[str] > max){
            max = freq[str];
            result = str;
        }
    }
    return result;
}
function isPowerOf2(num){
    if(num === 1) return true; //only exception in loop
    while(num>2){ //loop dividing by 2 until it reaches two or lower
        num/=2
    }
    if(num === 2) return true; //return true if it is 2
    return false;
}
function sortDescending(array){ //almost the same as bubble sort but descending
    let n = array.length;
    for(let i = 0; i< n-1;i++){
        for(let j = 0;j<n -i-1;j++){
            if(array[j]<array[j+1]){
                let temp = array[j];
                array[j] = array[j+1];
                array[j+1] = temp;
            }
        }
    }
    return array;
}
export {
    firstNonRepeating,
    bubbleSort,
    invertArray,
    invertArrayInplace,
    capitalize,
    mcd,
    hackerSpeak,
    factorize,
    deduplicate,
    findShortestString,
    isPalindrome,
    sortStrings,
    stats,
    popularString,
    isPowerOf2,
    sortDescending,
};