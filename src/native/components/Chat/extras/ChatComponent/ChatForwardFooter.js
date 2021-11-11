import React from "react";
import { Button, Footer, Row, Text } from "native-base";
import styles from "./Style";

function ChatFooter(props) {
  return (
    <Footer>
      <Row style={{ marginLeft: 20 }}>
        <Button
          style={styles.forwardButton}
          onPress={() => props.forwardList()}
        >
          <Text
            style={{
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            Forward
          </Text>
        </Button>
        <Button style={styles.cancelButton} onPress={() => props.onCancle()}>
          <Text style={{ color: "#000000" }}>Cancel</Text>
        </Button>
      </Row>
    </Footer>
  );
}

export default ChatFooter;
