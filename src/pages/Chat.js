import React, { Component } from "react";
import Header from "../components/Header";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      chats: [],
      content: "",
      readError: null,
      writeError: null,
      loadingChats: false,
      buttonType: "Send",
      key: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.myRef = React.createRef();
  }

  async componentDidMount() {
    this.setState({ readError: null, loadingChats: true });
    const chatArea = this.myRef.current;
    try {
      db.ref(this.props.location.state).on("value", (snapshot) => {
        let chats = [];
        snapshot.forEach((snap) => {
          chats.push({
            key: snap.key,
            content: snap.val().content,
            timestamp: snap.val().timestamp,
            uid: snap.val().uid,
          });
        });
        chats.sort(function (a, b) {
          return a.timestamp - b.timestamp;
        });
        this.setState({ chats });
        chatArea.scrollBy(0, chatArea.scrollHeight);
        this.setState({ loadingChats: false });
      });
    } catch (error) {
      this.setState({ readError: error.message, loadingChats: false });
    }
  }

  handleChange(event) {
    this.setState({
      content: event.target.value,
    });
  }

  async handleSubmit(event, value) {
    event.preventDefault();
    this.setState({ writeError: null });
    const chatArea = this.myRef.current;
    try {
      if (value === "Send") {
        await db.ref(this.props.location.state).push({
          content: this.state.content,
          timestamp: Date.now(),
          uid: this.state.user.uid,
        });
      } else {
        await db
          .ref(this.props.location.state)
          .child(this.state.key)
          .update({ content: this.state.content });
        this.setState({ buttonType: "Send" });
      }

      this.setState({ content: "" });
      chatArea.scrollBy(0, chatArea.scrollHeight);
    } catch (error) {
      this.setState({ writeError: error.message });
    }
  }

  formatTime(timestamp) {
    const d = new Date(timestamp);
    const time = `${d.getDate()}/${
      d.getMonth() + 1
    }/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
    return time;
  }

  handleDeleteMessage = (key) => {
    db.ref(this.props.location.state).child(key).remove();
  };

  handleUpdate = (chat) => {
    this.setState({
      content: chat.content,
      buttonType: "Update",
      key: chat.key,
    });
  };

  render() {
    return (
      <div>
        <Header />
        <div className="chat-area" ref={this.myRef}>
          {/* loading indicator */}
          {this.state.loadingChats ? (
            <div className="spinner-border text-success" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            ""
          )}
          {/* chat area */}
          {this.state.chats.map((chat) => {
            return (
              <p
                key={chat.timestamp}
                className={
                  "chat-bubble " +
                  (this.state.user.uid === chat.uid ? "current-user" : "")
                }
              >
                <sapn className="text">{chat.content}</sapn>
                <div className="operation-icon">
                  <i
                    class="fa fa-pencil"
                    aria-hidden="true"
                    style={{ marginRight: "5px" }}
                    onClick={() => {
                      this.handleUpdate(chat);
                    }}
                  ></i>
                  <i
                    class="fa fa-trash"
                    aria-hidden="true"
                    onClick={() => this.handleDeleteMessage(chat.key)}
                  ></i>
                </div>
                <br />
                <span className="chat-time float-right">
                  {this.formatTime(chat.timestamp)}
                </span>
              </p>
            );
          })}
        </div>
        <form className="mx-3">
          <textarea
            className="form-control"
            name="content"
            onChange={this.handleChange}
            value={this.state.content}
          ></textarea>
          {this.state.error ? (
            <p className="text-danger">{this.state.error}</p>
          ) : null}
          <button
            type="submit"
            className="btn btn-submit px-5 mt-4"
            onClick={(e) => this.handleSubmit(e, this.state.buttonType)}
          >
            {this.state.buttonType}
          </button>
        </form>
        <div className="py-5 mx-3">
          Login in as:{" "}
          <strong className="text-info">{this.state.user.email}</strong>
        </div>
      </div>
    );
  }
}
