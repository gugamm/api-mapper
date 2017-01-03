Api-Mapper
===================
Api-Mapper is a library written in TypeScript. It is easy to use, isomorphic, lightweight and has no dependency!

Version
-------------
v1.2

Docs
-------------

####  Getting Started

I have not published this library to any package manager repository yet, so you need to clone this repository. It is easy to get started.

```
git clone https://github.com/gugamm/api-mapper.git
```

Once cloned, copy all files in "src" directory to any directory of your preference

#### How does it work?
First you create a configuration, defining the host, resources and end-points. Then, you can create a MpHttpLayer or use a third-party one. Then, you can create an MpApiMap, an object that has all methods to access your api.

#### Creating a MpConfig

```
var myConfig : MpConfig = {
	host : 'http://www.myapi.com/api',
	resources : [
		{
			host : '/students',
			name : 'Students',
			endPoints : [
				{
					name : 'getStudents',
					path : ''
				},
				{
					name : 'getStudent',
					path : '/{id}'
				}
			]
		}
	]
}
```

#### Creating an MpHttpLayer
The HttpLayer is responsible for making the request. This library is isomorphic, which means it can be used either on client or server. The HttpLayer is what makes this possible, since you can implement your own http layer depending if you are on a browser, or developing an application with NodeJs. 
The MpHttpLayer is an interface that has all common Http methods : Get, Post, Put, Delete and Head. You **are not required to implement all methods**, **but you must implement all methods that your api will use**.
All methods receive a request and options(you can pass parameters to your layer using this object), and must return a promise that will resolve in a MpResponse or reject with anything.
Here is a example

```
var myHttpLayer : MpHttpLayer = {
	get : function (request : MpRequest, options ?: any) : Promise<MpResponse> {
		return new Promise(function (resolve, reject) {
			const response : MpResponse = {
				data : 'Hello World'
			};
			resolve(response);
		});
	}
}
```

#### Using the built-in MpHttpLayer

This library comes with an implementation of the MpHttpLayer for the browser, so you can get started quickly. Just import the MpBrowserHttpLayer, create an instance and use it as a parameter for the MpApiMap. Here is an example :

```
import { MpBrowserHttpLayer } from 'directorytoapimapper/index';

//config...
let browserHttpLayer = new MpBrowserHttpLayer();

```


#### Creating an MpApiMap

The MpApiMap is the object that has all methods created according to your configuration. He is very simple to use and very powerfull.
This object represents the Map of your Api. You can access your resources by the "name" defined in your configuration and the endpoints(see first request example). **For each endpoint, is created a function with a name defined in your configuration**. This function has 4 parameters. An object(with key/value) that will fullfill your parameters, an object or anything that will fullfill your body, an object(with key/value) that will fullfill your headers **and an object(key/value) that you can use to pass extra parameters to your HttpLayer**. To create a MpApiMap, you need a configuration and an implementation of the HttpLayer. Here is a example

```
//using your layer
var myApiMap : any = new MpApiMap(myConfig, myHttpLayer);

//using the built in browser layer
var myApiMap : any = new MpApiMap(myConfig, new MpBrowserHttpLayer());
```

> **Note** I used "any", this is because **I can't define a Type for the generated object since it depends on your configuration**. I'm working on a project to create a definition type for your configuration in development type, so you can be type safe. For now, use "any". 

#### First request
```
myApiMap.Students.getStudents().then(
	(response : MpResponse) => console.log(response.data) //'hello world'
}

myApiMap.Students.getStudent({id : 10}).then(
	(response : MpResponse) => console.log(response.data) //'hello world'
}
```

Advanced docs
-------------------
Lets explore some advanced features that Api-Mapper provide.

#### Path Parameters and Query String

Note in our example "first request", we pass an object as the first argument to "getStudent" method. This object is used to set parameters for a request. If a parameter is a path parameter(in this case 'id'), then it will be replaced in the fullPath of the request. If its not a path parameter, then it will be added as a query string parameter.

Example :
```
myApiMap.Students.getStudent({id : 10, anotherParameter : 'example'}).then(
	(response : MpResponse) => console.log(response.data) //'hello world'
}
```

The result path is : "http://www.myapi.com/api/students/10?anotherParameter=example"

#### Headers

You can set headers at **configuration time or at run-time**(after the map has been created). To do so, use the property "headers" defined in MpConfig, MpResource and MpEndPoint.

Example :

```
var myConfig : MpConfig = {
	host : 'http://www.myapi.com/api',
	headers : {
		'A-Header' : 'hello-world'
	},
	resources : [
		{
			host : '/students',
			name : 'Students',
			headers : {
				'A-Header' : 'bye-world'
			},
			endPoints : [
				{
					name : 'getStudents',
					path : '',
					headers : {
						'A-Header' : 'blablum'
					},
				},
				{
					name : 'getStudent',
					path : '/{id}
				}
			]
		}
	]
}
```

Run-Time example :

```
api.Students.endPoints['getStudents'].headers = { 'Content-Type' : 'text/plain' };
api.Students.headers = { 'Content-Type' : 'text/plain' };
api.headers = { 'Content-Type' : 'text/plain' };
```

> **Note:** There is a override order that this library follows. It is from outside to inside, therefore, 'A-Header' final value is going to be 'blablum'.

#### BeforeRequest and AfterResponse

These are two events that occour before a request starts and after a request finish. You can use it to log or do some validation. They are functions that can return a boolean or a Promise<boolean>. If beforeRequest resturns false, the request is cancelled. BeforeRequest must return true to continue the request. The results of AfterResponse will be ignored, so you can return anything. If you return a Promise, the application will wait for the promise to complete

Example

```
var myConfig : MpConfig = {
	host : 'http://www.myapi.com/api',
	beforeRequest : function (request : MpRequest) : boolean {
		console.log('Before every request');
		return true;
	},
	afterResponse : function (request : MpRequest, response : MpResponse) : any {
		response.data = 'This is so cool'; //You can do any transformation here
		console.log('After called');
		return 'blablabla';
	},
	resources : [
		{
			host : '/students',
			name : 'Students',
			beforeRequest : function (request : MpRequest) : boolean {
				console.log('Before any Students request');
				return true;
			},
			endPoints : [
				{
					name : 'getStudents',
					path : '',
					beforeRequest : function (request : MpRequest) : boolean {
						console.log('Before getStudents request');
						return true;
					}
				},
				{
					name : 'getStudent',
					path : '/{id}
				}
			]
		}
	]
}
```
the result for **myApiMap.getStudents().then((response : MpResponse) => console.log(response.data))** will be :
```
 //Before getStudents request
 //Before any Students request
 //Before every request
 //After called
 //This is so cool
```


> **Note:** There is a override order that this library follows. It is from outside to inside. So request events handler defined globally are called and resolved before inner handlers. Note that if a handler returns a Promise, the application will wait for that Promise to finish before executing the next one. If a Promise resolve false, the others Promises will not execute, since the request will be cancelled.

####  Adding a resource at run-time

```
const resource : MpResource = {
	host : '/players',
	name : 'Players',
	endPoints : [
		{
			name : 'getPlayers',
			path : ''
		}
	]
}

myApiMap.addResourceMap(myApiMap.buildResourceMap(resource));

myApiMap.Players.getPlayers().then(
	(response : MpResponse) => console.log(response.data)
);
```

####  Modifying end point at run-time

To access the end points of a resource just use the 'endPoints' property of a resource.

```
myApiMap.Students.endPoints['getStudent'].path = '/';
myApiMap.Students.endPoints['getStudent'].method = MpHttpRequestMethod.POST;
myApiMap.Students.endPoints['getStudent'].beforeRequest = function (request : MpRequest) : boolean { 
	return true; 
};
```

**This library does not support changing name at run-time. In future versions, this may be possible. Another feature is that we will be able to add and remove end points of a resource at run-time**.

####  Generated end point methods

The generated end-point methods accept three arguments : 
params ?: MpParams, body ?: any, headers ?: MpHeaders, **options ?: any**

 params, body and headers are used to build the MpRequest that you see in RequestEvents and in your MpHttpLayer.

options is an extra argument that you can use to pass some custom parameters to your MpHttpLayer methods. 

This is an advanced feature that can be used by third-party MpHttpLayer developers to provide some extra funcionality.


----------


License
-------------
MIT
