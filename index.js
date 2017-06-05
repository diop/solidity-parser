var PEG = require("pegjs");
var fs = require("fs");
var path = require("path");

var builtParsers = {
  "solidity": require("./build/parser"),
  "imports": require("./build/imports_parser"),
  "expression": require("./build/exp_parser")
};

// TODO: Make all this async.
module.exports = {
  getParser: function(parser_name, rebuild) {
    if (rebuild == true) {
      var parserfile = fs.readFileSync(path.resolve("./" + parser_name + ".pegjs"), {encoding: "utf8"});
      return PEG.generate(parserfile);
    } else {
      return builtParsers[parser_name];
    }
  },
  parse: function(source, parser_name, rebuild) {
    if (typeof parser_name == "boolean") {
      rebuild = parser_name;
      parser_name = null;
    }

    if (parser_name == null) {
      parser_name = "solidity";
    }

    var parser = this.getParser(parser_name, rebuild);

    var result = parser.parse(source);

    return result;
  },
  parseFile: function(file, parser_name, rebuild) {
    if (typeof parser_name == "boolean") {
      rebuild = parser_name;
      parser_name = null;
    }

    if (parser_name == null) {
      parser_name = "solidity";
    }

    try {
      var source = fs.readFileSync(path.resolve(file), {encoding: "utf8"})
      return this.parse(source, parser_name, rebuild);
    } catch (e) {
      var parser = this.getParser(parser_name, false);

      if (e instanceof parser.SyntaxError) {
        const message = `${e.message} (${file}:${e.location.start.line}:${e.location.start.column})`;
        throw new parser.SyntaxError(message, e.expected, e.found, e.location)
      } else {
        throw e;
      }
    }
  }
};
