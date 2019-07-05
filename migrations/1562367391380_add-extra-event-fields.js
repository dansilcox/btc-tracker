exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("events", {
      properties: { 
        type: "text", 
        notNull: true, 
        desc: "JSON serialised list of properties relevant to the specific event"
      }
    });
};

exports.down = (pgm) => {
  pgm.dropColumns("events", [
    'properties'
  ])
};
