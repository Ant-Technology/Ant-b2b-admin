import { useState } from "react";
import {
  AppShell,
  Navbar,
  Header,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
import NavbarSimple from "../navigation";

const Layout = ({ children,setPosition }) => {
  const {  width } = useViewportSize();
  const largeScreen = useMediaQuery("(min-width: 800px)");

  const theme = useMantineTheme();
  const [opened, setOpened] = useState(true);
  return (
    <AppShell
      styles={{
        main: {
          paddingLeft: opened ? width / 5 : width / 14,
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
          transition: "all .2s ease-in",
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          // width={{ sm: 200, lg: 200 }}
          style={{ maxWidth: width / 14 }}
        >
          <NavbarSimple opened={opened} setOpened={setOpened} setPosition={setPosition} />
        </Navbar>
      }
      // aside={
      //   <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
      //     <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
      //       <Text>Application sidebar</Text>
      //     </Aside>
      //   </MediaQuery>
      // }

      header={
        !largeScreen ? (
          <Header height={70} p="md">
            <div
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>

              <Text>ACT B2B</Text>
            </div>
          </Header>
        ) : null
      }
    >
      {children}
    </AppShell>
  );
};

export default Layout;
