import { Header } from "./Header";
import "./Layout.scss";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="wrapper">
      <div className="inner-wrapper">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default Layout;
