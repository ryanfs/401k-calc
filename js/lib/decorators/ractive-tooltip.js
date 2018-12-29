var tooltipDecorator = function ( node, options ) {
    var tooltip, handlers, eventName;

  
console.log(options);
    // ...and insert it before the node
    
  
    // Create some event handlers. NB we can use addEventListener
    // with impunity, even in old IE, by using a legacy build:
    // https://docs.ractivejs.org/latest/Legacy-builds
    handlers = {
      focus: function () {
        node.parentNode.classList.add("active");  
        // Create a tooltip...
        tooltip = document.createElement( 'p' );
        tooltip.className = 'ractive-tooltip';
        tooltip.textContent = 'test';
        node.parentNode.insertBefore( tooltip, node );
   
      },
  
      signalErrorEvent : function(){
        alert('error');
      },
       
      onfocusout : function () {
        // Destroy the tooltip when the mouse leaves the node
        node.parent.parentNode.classList.add("active");  
        tooltip.parentNode.removeChild( tooltip );
      }
    };
  
    // Add event handlers to the node
    for ( eventName in handlers ) {
      if ( handlers.hasOwnProperty( eventName ) ) {
        node.addEventListener( eventName, handlers[ eventName ], false );
      }
    }
  
    // Return an object with a `teardown()` method that removes the
    // event handlers when we no longer need them
    return {
      teardown: function () {
        for ( eventName in handlers ) {
          if ( handlers.hasOwnProperty( eventName ) ) {
            node.removeEventListener( eventName, handlers[ eventName ], false );
          }
        }
      }
    };
  };
