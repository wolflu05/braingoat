import "./Header.scss";
import logo from "../../assets/braingoat.svg";
import githubMark from "../../assets/github-mark.svg";

export const Header = () => {
  return (
    <div className="header">
      <div className="header-container">
        <img src={logo} alt="Logo" className="braingoat-logo" />
        <h1>Braingoat</h1>
      </div>

      <div className="header-container">
        <a href="https://github.com/wolflu05/braingoat" rel="noopener noreferrer" target="_blank">
          <img src={githubMark} alt="GitHub" className="github-logo" />
        </a>
      </div>
    </div>
  );
};
