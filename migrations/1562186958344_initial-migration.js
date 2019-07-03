exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("event_triggers", {
    id: "id",
    name: { type: "varchar(256)", notNull: true, desc: "Name of the event trigger (e.g. 'Price lower bound')" },
    desc: { type: "varchar(1500)", default: null, desc: "Longer description if required" },
    triggerCurrency: { type: "varchar(3)", notNull: true, desc: "Currency to go with price for trigger"},
    triggerPrice: { 
      type: "numeric(12,4)", 
      notNull: true, 
      desc: "Price (in given currency) at which the event fires"
    },
    createdAt: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  });

  pgm.createTable("events", {
    id: "id",
    name: { type: "varchar(256)", notNull: true, desc: "Name of the event (e.g. 'send email')" },
    desc: { type: "varchar(1500)", default: null, desc: "Longer description if required"},
    eventType: { type: "varchar(50)", desc: "Type of event (TODO: make this an enum or lookup to another table)"},
    createdAt: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  });

  pgm.createIndex("event_triggers", "name");
  pgm.createIndex("events", "name");
};

exports.down = (pgm) => {
  pgm.dropTable("event_triggers");
  pgm.dropTable("events");
};
