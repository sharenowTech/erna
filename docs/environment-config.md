### Environment Validation & Configuration
The validator (`./lib/env/validator.js`) is reponsible for handling and validating environment variables. The schema listed in `./lib/env/schema.js` defines which variables are required, what are their defaults, which regex pattern is required and how to transform the passed values.

For this purpose the schema is an object of objects with the following properties:

- `name <string>`  
  Define the name of the instance variable which exposes the transformed value.  
  E.g. `name="port"` enables access via `env.port`.

- `[required=false] <boolean>`  
  Define if a environment variable is required.  
  Throws an error in case of `undefined`.  

- `[desc=''] <string>`  
  Short escription of the related variable.
  Should be provided for a object even though its not required. It enriches the error messages which further details.

- `[default=undefined] <*>`  
  The default value of the variable.  
  Is only mindful in the case of optional ones.

- `[pattern=undefined] <RegExp>`  
  The pattern which validates the value of a defined variable. Has no effect in case of `undefined`.  
  Throws an error in case of failure.

- `[transform=undefined] <Function>`  
  A function which transforms the value (or default).  
  The function receives the value a first argument and is required to return a new value.

  Example:
  ```js
  {
    name: 'port',
    default: '3000',
    transform(x) {
      return parseInt(x, 10)
    }
  }
  ```

  This definition allows access to the port parsed as integer via `env.port`.

- `[props=undefined] <Object.<Function>>`  
  An object of function which behave like `transform` but enable various representations of a single variable.  
  It is not possible to define both `props` and `transform`.

  Example:
  ```js
  {
    name: 'users',
    props: {
      list(x) {
        return x.split(' ')
      },
      raw(x) {
        return x
      }
    }
  }
  ```

  This definition allows access to a split string via `env.users.list` and the original string via `env.users.raw`.
