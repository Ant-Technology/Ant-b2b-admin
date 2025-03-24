import { useState } from "react";
import {
  Paper,
  createStyles,
  TextInput,
  PasswordInput,
  Button,
  Form,
  Title,
  LoadingOverlay,
} from "@mantine/core";
import { useLazyQuery, useMutation } from "@apollo/client";
import { LOGIN } from "../apollo/mutuations";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { AUTH } from "apollo/queries";
import { authDataVar } from "apollo/store";

const useStyles = createStyles((theme) => ({
  wrapper: {
    height: "100vh",
    backgroundSize: "cover",
    backgroundImage:
      "url(https://indian-retailer.s3.ap-south-1.amazonaws.com/s3fs-public/2020-08/B2B_0.jpg)",
  },

  form: {
    borderRight: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    minHeight: "100vh",
    maxWidth: 450,
    paddingTop: 80,

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      maxWidth: "100%",
    },
  },

  title: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  logo: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    width: 120,
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
}));

const Login = () => {
  const { classes } = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginReq, { loading }] = useMutation(LOGIN);
  const [authdata, { loading: authLoading }] = useLazyQuery(AUTH);
  const navigate = useNavigate();
  const login = (e) => {
    e.preventDefault();
    loginReq({
      fetchPolicy: "no-cache",
      variables: {
        email,
        password,
      },
      onCompleted(data) {
        if (data.login.token) {
          localStorage.setItem("auth_token", data.login.token);
          localStorage.setItem(
            "permissions",
            JSON.stringify(data.login.permissions)
          );
          localStorage.setItem("roles", JSON.stringify(data.login.roles));
          const tok = localStorage.getItem("auth_token");
          authdata({
            onCompleted(data) {
              authDataVar(data);
            },
          });
          if (tok && authDataVar().auth) {
            navigate("/");
          }
        }
      },
      onError(err) {
        showNotification({
          color: "red",
          title: "Error",
          message: `${err}`,
        });
      },
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      login(event);
    }
  };

  return (
    <div className={classes.wrapper}>
      <LoadingOverlay visible={loading || authLoading} />
      <Paper className={classes.form} radius={0} p={30}>
        <Title
          order={2}
          className={classes.title}
          align="center"
          mt="md"
          mb={50}
        >
          Welcome back to ANT B2B!
        </Title>
        <form onSubmit={login}>
          <TextInput
            label="Email address"
            placeholder="hello@gmail.com"
            size="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {/* <Checkbox label="Keep me logged in" mt="xl" size="md" /> */}
          <Button fullWidth mt="xl" size="md" onClick={login}>
            Login
          </Button>

          {/* <Text align="center" mt="md">
          Don&apos;t have an account?{" "}
        </Text> */}
        </form>
      </Paper>
    </div>
  );
};

export default Login;
