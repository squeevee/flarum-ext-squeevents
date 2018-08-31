# Squeevents

A simple linker for accessing Flarum component events from ad-hoc scripts.

Sometimes you want to make small adjustments to your Flarum's view. On the one hand LESS might not be dynamic enough to get the job done; but on the other having a dozen micro-extensions, or one big cluttered 'junk drawer' extension could spell trouble for keeping your site organized and maintainable.

That's where Squeevents comes in.

Squeevents allows you to write functions in your forum's Custom Header that get called during component events. These can be used to modify both the DOM and component object properties.

## Usage

When installed and enabled, the Squeevents API is loaded automatically on every Forum page. Create a `<script>` element in your Custom Header and simply call one of the methods below to register a function to the desired event.

    squeevents.extend(module, method, callback) ...
    squeevents.override(module, method, callback) ...

 + `module` is a string containing the path to the desired component class, as it would appear in an `import` statement.
 + `method` is a string containing the name of the method on the component class that our callback will extend or override.
 + `callback` is a function that will be called at the component event.
    
In `callback`, `this` is bound to the component object to which the event is happening.

An example:

    <script>

    squeevents.extend('flarum/components/Post', 'config', function() {
      $(this.element).find('.Post-body img').wrap(function() {
        var link = document.createElement('a');
        link.setAttribute('href', this.getAttribute('src'));
        link.setAttribute('target', '_blank');
        return link;
      });
    });

    </script>
    
If the forum is in debug mode, then Squeevents will log messages to the console when a registered event occurs, as well as if there are any errors while resolving the module and method, or while executing the callback function. If the forum is not in debug mode, events and errors will occur silently. This behavior can be overridden by setting `squeevents.enable_log` in a script in the Custom Header.

## Extend and Override
    
The two methods available for Squeevents are `extend` and `override`. These match the behavior of the functions in `'flarum/extend'` by the same name.

Calling `extend` adds functionality *after* an existing method. After the given method is complete, `callback` will be called, and the first argument passed to `callback` will be the return value of the original method. The subsequent arguments will be the arguments passed to the original method.

Calling `override` *replaces* the functionality of an existing method. `callback` will be called immediately, and the first argument passed to it will be a function reference to the original method. The subsequent arguments will be the arguments passed to the original method. This can be used to add functionality before an existing method.

## Component methods

A selection of methods which all Flarum components inherit, with details as given in the source code:

 + `init` - Called when the component is constructed.
 + `onunload` - Called when the component is destroyed, i.e. after a redraw where it is no longer a part of the view.
 + `config` - Called after the component's root element is redrawn. This hook can be used to perform any actions on the DOM, both on the initial draw and any subsequent redraws.
 + `view` - Get the virtual DOM that represents the component's view.

For more info on virtual DOM and drawing logic, see Mithril's documentation.

## JQuery

By the grace of the core developers JQuery is in global scope when component events occur, which means that you can call `$` from within your callback functions to edit the DOM. You don't need to worry about importing it, and please do not add it as an external script to your header, as this can potentially cause undefined behavior.

## Other notes

**Squeevents is and always will be a kludge.** It is not intended to replace extensions or to act as some kind of frontend-only extension framework. If you need any kind of functionality that requires more than a few lines, and especially any data storage or calls to the API, *you should build an extension instead.*

It is with that in mind that I mention the following technical facts about Squeevents. In almost any case I can think of where these would be relevant, building an extension would be a preferable solution:

 + Squeevents can be used with classes besides components, like for example models. Any class in Flarum that is the default export of its module can be used with Squeevents.

 + Mithril's `m` function is also in global scope when component events occur. To avoid infinite recursion, do not call `m.redraw()` from within any component events. For security purposes, do not call `m.trust()`.

 + This extension is not a dynamic linker. It is only invoked once at start-time, and no events may be registered after that (i.e. from within squeevent callbacks, or from anywhere within other Flarum extensions). Attempting to do so will result in no effect.
 
I do not know how this extension will be affected by the switch to webpack with the impending Flarum beta 8. My suspicion is not much: since (if I understand correctly) we will still be using Babel for transpilation; but I haven't spent enough time looking (and lack the JavaScript experience) to be sure this extension won't be irreparably broken or obsoleted. Use with caution.