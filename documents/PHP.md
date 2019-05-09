# About

PHP is a server scripting language, and a powerful tool for making dynamic and interactive Web pages.

PHP is a widely-used, free, and efficient alternative to competitors such as Microsoft's ASP.

### Currently contain a lot of bugs, but it worked


# Document

[https://www.php.net/manual/en/]

# Example

```php
<?php
  $color = "red";
  echo "My car is " . $color . "<br>";
  echo "My house is " . $COLOR . "<br>";
  echo "My boat is " . $coLOR . "<br>";
?>
```

```php
<?php
  $x = 5; // global scope

  function myTest() {
      // using x inside this function will generate an error
      echo "<p>Variable x inside function is: $x</p>";
  } 
  myTest();

  echo "<p>Variable x outside function is: $x</p>";
?>
```

```php
<?php
  $t = date("H");

  if ($t < "10") {
      echo "Have a good morning!";
  } elseif ($t < "20") {
      echo "Have a good day!";
  } else {
      echo "Have a good night!";
  }
?>
```

```php
<?php 
  $x = 1; 

  while($x <= 5) {
      echo "The number is: $x <br>";
      $x++;
  } 
?>
```

```php
  <?php
  $cars = array("Volvo", "BMW", "Toyota");
  $arrlength = count($cars);

  for($x = 0; $x < $arrlength; $x++) {
      echo $cars[$x];
      echo "<br>";
  }
  ?>
```
