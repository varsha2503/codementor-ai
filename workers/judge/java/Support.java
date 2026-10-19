import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

@SuppressWarnings("unchecked")
public final class Support {
  private Support() {}

  public static String readAll() throws IOException {
    return new String(System.in.readAllBytes(), StandardCharsets.UTF_8);
  }

  public static Map<String, Object> parseInput(String raw) {
    Object value = Json.parse(raw.trim());
    if (!(value instanceof Map)) throw new RuntimeException("expected a JSON object input");
    return (Map<String, Object>) value;
  }

  public static int getInt(Map<String, Object> in, String key) {
    Object value = in.get(key);
    if (value instanceof Number n) return n.intValue();
    throw new RuntimeException("missing or invalid int key: " + key);
  }

  @SuppressWarnings("unchecked")
  public static List<Integer> getIntList(Map<String, Object> in, String key) {
    Object value = in.get(key);
    if (!(value instanceof List<?> list)) throw new RuntimeException("missing or invalid list key: " + key);
    List<Integer> out = new ArrayList<>();
    for (Object item : list) {
      if (!(item instanceof Number n)) throw new RuntimeException("list item is not a number");
      out.add(n.intValue());
    }
    return out;
  }

  public static String getString(Map<String, Object> in, String key) {
    Object value = in.get(key);
    if (value instanceof String s) return s;
    throw new RuntimeException("missing or invalid string key: " + key);
  }

  public static void printJson(Object value) {
    System.out.print(Json.stringify(value));
  }

  static final class Json {
    static Object parse(String s) {
      return new Parser(s).parse();
    }

    static String stringify(Object value) {
      if (value == null) return "null";
      if (value instanceof Boolean b) return b ? "true" : "false";
      if (value instanceof Number n) {
        if (value instanceof Double || value instanceof Float) return n.toString();
        return String.valueOf(n.longValue());
      }
      if (value instanceof String str) return "\"" + escape(str) + "\"";
      if (value instanceof List<?> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
          if (i > 0) sb.append(",");
          sb.append(stringify(list.get(i)));
        }
        return sb.append("]").toString();
      }
      if (value instanceof Map<?, ?> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<?, ?> e : map.entrySet()) {
          if (!first) sb.append(",");
          first = false;
          sb.append(stringify(String.valueOf(e.getKey()))).append(":").append(stringify(e.getValue()));
        }
        return sb.append("}").toString();
      }
      return "null";
    }

    static String escape(String s) {
      return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }

    static final class Parser {
      final String s;
      int i = 0;

      Parser(String s) {
        this.s = s;
      }

      Object parse() {
        skipWs();
        return value();
      }

      void skipWs() {
        while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++;
      }

      Object value() {
        skipWs();
        char c = s.charAt(i);
        if (c == '{') return object();
        if (c == '[') return array();
        if (c == '"') return string();
        if (c == 't') {
          expect("true");
          return true;
        }
        if (c == 'f') {
          expect("false");
          return false;
        }
        if (c == 'n') {
          expect("null");
          return null;
        }
        return number();
      }

      Map<String, Object> object() {
        expect('{');
        Map<String, Object> map = new LinkedHashMap<>();
        skipWs();
        if (peek('}')) {
          i++;
          return map;
        }
        while (true) {
          skipWs();
          String key = string();
          skipWs();
          expect(':');
          map.put(key, value());
          skipWs();
          if (peek('}')) {
            i++;
            break;
          }
          expect(',');
        }
        return map;
      }

      List<Object> array() {
        expect('[');
        List<Object> list = new ArrayList<>();
        skipWs();
        if (peek(']')) {
          i++;
          return list;
        }
        while (true) {
          list.add(value());
          skipWs();
          if (peek(']')) {
            i++;
            break;
          }
          expect(',');
        }
        return list;
      }

      String string() {
        expect('"');
        StringBuilder sb = new StringBuilder();
        while (i < s.length()) {
          char c = s.charAt(i++);
          if (c == '"') return sb.toString();
          if (c == '\\') {
            char n = s.charAt(i++);
            sb.append(switch (n) {
              case '"' -> '"';
              case '\\' -> '\\';
              case 'n' -> '\n';
              case 't' -> '\t';
              default -> n;
            });
          } else sb.append(c);
        }
        throw new RuntimeException("unterminated string");
      }

      Number number() {
        int start = i;
        if (s.charAt(i) == '-') i++;
        while (i < s.length() && Character.isDigit(s.charAt(i))) i++;
        if (i < s.length() && s.charAt(i) == '.') {
          i++;
          while (i < s.length() && Character.isDigit(s.charAt(i))) i++;
          return Double.parseDouble(s.substring(start, i));
        }
        return Long.parseLong(s.substring(start, i));
      }

      boolean peek(char c) {
        return i < s.length() && s.charAt(i) == c;
      }

      void expect(char c) {
        if (s.charAt(i) != c) throw new RuntimeException("expected " + c);
        i++;
      }

      void expect(String lit) {
        if (!s.startsWith(lit, i)) throw new RuntimeException("expected " + lit);
        i += lit.length();
      }
    }
  }
}
