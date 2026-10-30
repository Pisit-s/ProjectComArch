# Requirements: Interactive Floating-Point Learning Website

## 1. Project Overview

### 1.1 Purpose
Develop an interactive educational website for the Computer Architecture course. The website teaches binary numbers, binary fractions, IEEE 754 floating-point representation, and floating-point addition/subtraction.

### 1.2 Target Audience
- Learners who have little or no prior knowledge of binary numbers and floating-point representation.
- Computer Architecture students who want to understand how numbers are represented and processed by a computer.

### 1.3 Learning Approach
- Present concepts in a beginner-friendly order, from basic number systems to floating-point arithmetic.
- Use examples, visual representations, and interactive activities to reinforce each concept.
- Show intermediate steps so learners can understand how each result is obtained.
- Include a **Summary** at the end of every chapter.

---

## 2. General Website Requirements

### FR-01: Chapter Navigation
The website shall provide navigation to the following four chapters:
1. Number Systems and Binary Arithmetic
2. Decimal Fractions and Binary Fractions
3. IEEE 754 Floating-Point Representation
4. Floating-Point Addition and Subtraction

### FR-02: Learning Content
Each chapter shall include explanations, worked examples, and an interactive activity related to its topic.

### FR-03: Step-by-Step Explanations
Where a conversion or calculation involves multiple steps, the website shall display the intermediate steps in a clear order rather than showing only the final answer.

### FR-04: Interactive Input
Interactive activities shall allow users to enter values or change bits as appropriate. The website shall validate inputs and provide a clear message when an input is invalid.

### FR-05: Chapter Summary
Each chapter shall end with a Summary section that reviews its main concepts and key takeaways.

### FR-06: Beginner-Friendly Interface
The interface shall use clear labels, readable explanations, and consistent terminology. Technical terms shall be explained when they first appear.

---

## 3. Chapter Requirements

## Chapter 1: Number Systems and Binary Arithmetic

### 3.1 Learning Objectives
By the end of this chapter, learners should be able to:
- Understand the basic idea of a number system and positional notation.
- Explain the relationship between decimal (base 10) and binary (base 2).
- Convert an unsigned binary integer to its decimal value.
- Understand the contribution of each bit to the total value.

### 3.2 Required Content
- Explain how the decimal number system works, including place values such as ones, tens, and hundreds.
- Introduce binary numbers and explain that binary uses only the digits `0` and `1`.
- Explain binary positional weights: `2^0`, `2^1`, `2^2`, and so on.
- Show worked examples converting binary integers to decimal.
- Explain the range of an 8-bit unsigned binary integer: `0` to `255`.

### 3.3 Interactive Requirements
**8-bit Binary Integer Explorer**
- Display an 8-bit field.
- Allow users to toggle each bit between `0` and `1`.
- Display the positional weight of each bit.
- Display each bit's contribution to the total value.
- Update the decimal value immediately whenever a bit changes.
- Show the resulting 8-bit binary number and its decimal equivalent.

### 3.4 Chapter Summary
Summarize positional notation, the relationship between decimal and binary, binary place values, and how the value of an 8-bit unsigned integer is calculated.

---

## Chapter 2: Decimal Fractions and Binary Fractions

### 4.1 Learning Objectives
By the end of this chapter, learners should be able to:
- Understand how fractional place values work in base 10.
- Understand binary fractional place values.
- Calculate the decimal value represented by a binary fraction.
- Recognize that some decimal fractions cannot be represented exactly using a finite number of binary fractional bits.

### 4.2 Required Content
- Explain decimal fractional place values, such as `10^-1`, `10^-2`, and `10^-3`.
- Connect decimal fractional place values to binary fractional weights: `2^-1`, `2^-2`, `2^-3`, and so on.
- Explain binary fractions using notation such as `0.b1b2...`.
- Show worked examples converting binary fractions to decimal.
- Explain that some decimal fractions, such as `0.1`, have repeating binary expansions.
- Explain that storing only a finite number of bits gives an approximation for some values, which can cause a small conversion error.

### 4.3 Interactive Requirements
**16-bit Binary Fraction Explorer**
- Display 16 fractional bits with weights from `2^-1` through `2^-16`.
- Allow users to toggle each bit between `0` and `1`.
- Display the weight and decimal contribution of each bit.
- Update the represented decimal value immediately whenever a bit changes.
- Display the binary fraction and its decimal equivalent.

**Fraction Conversion Demonstration**
- Allow users to enter a decimal fraction and view its conversion to binary fraction.
- Show the conversion steps using repeated multiplication by `2`.
- When the binary expansion does not terminate, show the selected finite-bit approximation and the difference between the original value and the approximation.

### 4.4 Chapter Summary
Summarize decimal and binary fractional place values, the weights of binary fractional bits, the conversion method, and why some values require approximation.

---

## Chapter 3: IEEE 754 Floating-Point Representation

### 5.1 Learning Objectives
By the end of this chapter, learners should be able to:
- Explain why floating-point representation is used for non-integer values and very large or very small numbers.
- Understand the relationship between scientific notation and binary scientific notation.
- Identify the sign, exponent, and fraction fields in IEEE 754 single precision.
- Convert a supported decimal number to IEEE 754 single-precision representation and decode it back.

### 5.2 Required Content
- Introduce decimal scientific notation, for example, `1.25 × 10^3`.
- Connect decimal scientific notation to normalized binary notation, such as `1.xxxxx × 2^e`.
- Explain IEEE 754 floating-point representation and its purpose.
- Explain the 32-bit single-precision layout:
  - Sign: 1 bit
  - Exponent: 8 bits
  - Fraction: 23 bits
- Explain the single-precision exponent bias of `127`.
- Explain the role of each field:
  - Sign indicates whether the value is positive or negative.
  - Exponent stores the exponent using a bias.
  - Fraction stores the fractional portion of the significand for normalized values.
- Demonstrate the conversion process:
  1. Convert the number to binary.
  2. Normalize the binary number.
  3. Determine the sign bit.
  4. Calculate the biased exponent.
  5. Fill the fraction field.
  6. Combine the fields into the 32-bit representation.
- Demonstrate decoding by separating the fields and reconstructing the represented value.
- Explain that not every real number can be represented exactly in a finite number of bits.

### 5.3 Interactive Requirements
**Decimal-to-IEEE 754 Converter**
- Allow users to enter a decimal value.
- Convert the input to IEEE 754 single precision.
- Display the sign, exponent, and fraction fields separately.
- Display the complete 32-bit representation.
- Show the conversion process step by step.
- Clearly indicate when the stored value differs from the input because of rounding or limited precision.

**IEEE 754-to-Decimal Decoder**
- Allow users to enter or edit a valid 32-bit representation.
- Separate the bits into sign, exponent, and fraction fields.
- Show how the fields are interpreted.
- Display the decoded value.
- Explain the decoding steps in order.

**Interaction Modes**
- Provide two modes: decimal-to-IEEE 754 encoding and IEEE 754-to-decimal decoding.
- Allow users to switch between the two modes.

### 5.4 Scope Notes
- The required implementation shall focus on IEEE 754 32-bit single precision.
- Support for double precision, subnormal values, infinities, NaN, and signed zero may be added later if time permits; these are not required for the initial version.
- The website shall state any input limitations of the converter.

### 5.5 Chapter Summary
Summarize scientific notation, normalization, the sign/exponent/fraction fields, exponent bias, the encoding and decoding processes, and the limitations of finite-precision representation.

---

## Chapter 4: Floating-Point Addition and Subtraction

### 6.1 Learning Objectives
By the end of this chapter, learners should be able to:
- Understand why floating-point addition and subtraction require more than ordinary decimal arithmetic.
- Describe the main stages used to add or subtract floating-point values.
- Follow the intermediate steps in a floating-point calculation.
- Recognize that rounding and finite precision can affect the result.

### 6.2 Required Content
Explain the main stages of floating-point addition and subtraction using accessible examples:
1. Encode or inspect the floating-point representations of both operands.
2. Separate the sign, exponent, and significand information.
3. Align the exponents by shifting the significand of the operand with the smaller exponent.
4. Add or subtract the significands as appropriate for the operand signs and selected operation.
5. Normalize the result when necessary.
6. Round the result to the available precision.
7. Encode and display the final floating-point result.

The explanation shall clarify that this is a learning-oriented illustration of the main stages, not a complete description of every hardware implementation detail.

### 6.3 Interactive Requirements
**Floating-Point Arithmetic Simulator**
- Allow users to enter two decimal operands.
- Allow users to select addition (`+`) or subtraction (`−`).
- Convert the operands to IEEE 754 single precision before performing the simulated floating-point operation.
- Display the bit fields of both operands.
- Show the intermediate steps: field interpretation, exponent alignment, significand arithmetic, normalization, rounding, and final encoding where applicable.
- Display the final floating-point result.
- Where useful, display the exact mathematical result alongside the simulated floating-point result to illustrate rounding or precision differences.
- Ensure the simulation follows floating-point precision rules; it shall not simply calculate the exact decimal answer first and encode only the final result.

### 6.4 Chapter Summary
Summarize exponent alignment, significand addition/subtraction, normalization, rounding, and how finite precision may affect arithmetic results.

---

## 4. Usability and Validation Requirements

### NFR-01: Clear Feedback
The website shall provide clear feedback for invalid or unsupported input, rather than failing silently.

### NFR-02: Immediate Interaction Feedback
For bit-toggle activities, the displayed value and bit contributions shall update immediately after a bit changes.

### NFR-03: Step Visibility
Users shall be able to follow the calculation process in sequence, with each step clearly labeled.

### NFR-04: Consistent Presentation
Terminology, bit-field colors or visual styles (if used), number formatting, and navigation shall remain consistent across chapters.

### NFR-05: Responsive Layout
The website should remain usable on common desktop and mobile screen sizes.

### NFR-06: Scope and Accuracy
Interactive results shall be consistent with the concepts explained in the lesson. Any implementation limitations or unsupported inputs shall be communicated to users.

---

## 5. Out of Scope for the Initial Version

The following features are not required for the initial version:
- Quizzes, scoring systems, or learning-progress tracking.
- User accounts or login.
- Saving user activity or personal progress.
- Advanced coverage of every IEEE 754 special value.
- Double-precision (64-bit) interactive conversion.
- Detailed simulation of hardware-specific floating-point circuits.

These may be considered for a future version if time and project scope allow.

---

## 6. Minimum Acceptance Criteria

The website will be considered to meet the core requirements when:

- [ ] Users can navigate to all four chapters.
- [ ] Chapter 1 provides a working 8-bit binary integer explorer with a correct decimal result.
- [ ] Chapter 2 provides a working 16-bit binary fraction explorer with correct bit weights and decimal result.
- [ ] Chapter 2 demonstrates decimal-to-binary fraction conversion and explains finite-bit approximation where relevant.
- [ ] Chapter 3 can encode supported decimal inputs into IEEE 754 single precision and display all fields and steps.
- [ ] Chapter 3 can decode a valid 32-bit IEEE 754 single-precision input into its represented value.
- [ ] Chapter 4 simulates single-precision floating-point addition and subtraction with visible intermediate steps.
- [ ] Each chapter includes a Summary at the end.
- [ ] Invalid or unsupported inputs produce understandable feedback.
- [ ] The core interactions update and display results correctly.
