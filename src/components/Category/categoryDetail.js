import { useState } from "react";
import {
  Table,
  ScrollArea,
  Card,
  Button,
  Modal,
  LoadingOverlay,
  Grid,
  Stack,
  Select,
  createStyles,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Image,
} from "@mantine/core";
import { useQuery } from "@apollo/client";
import { customLoader } from "components/utilities/loader";
import { GET_CATEGORY, GET_PRODUCT, GET_SHIPMENTS } from "apollo/queries";
import { UserPlus, Discount2, Receipt2, Coin } from "tabler-icons-react";
import { useViewportSize } from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },

  value: {
    fontSize: 17,
    fontWeight: 500,
    lineHeight: 1,
  },

  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  title: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
}));

const icons = {
  user: UserPlus,
  discount: Discount2,
  receipt: Receipt2,
  coin: Coin,
};

function CategoryDetailModal({ Id }) {
  // state variables
  const { classes } = useStyles();
  const [category, setCategory] = useState();

  const { loading: categoryLoading } = useQuery(GET_CATEGORY, {
    variables: { id: Id },
    onCompleted(data) {
      let category = data.category;
      setCategory(category);
    },
  });
  const { height } = useViewportSize();
  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <div style={{ width: "98%", margin: "auto" }}>
        <LoadingOverlay
          visible={categoryLoading}
          color="blue"
          overlayBlur={2}
          loader={customLoader}
        />
        <Card style={{ width: "40%" }} shadow="sm" radius="md" withBorder>
          <div style={{ paddingLeft: "20px" }}>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Name<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{category?.name}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Subcategories Count
                  <span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{category?.children_count}</Text>
            </Group>
          </div>
        </Card>
        <Card style={{ marginTop: "30px" }} shadow="sm" p="lg">
          <ScrollArea>
            <div style={{ display: "flex", width: "90%" }}>
              <div
                style={{
                  marginRight: "40px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Text size="md" weight={500} className={classes.diff}>
                  <span>Subcategories</span>
                </Text>
                <Table
                  horizontalSpacing="md"
                  verticalSpacing="xs"
                  sx={{ tableLayout: "fixed", minWidth: 500 }}
                >
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Product Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category?.children?.length > 0 ? (
                      <>
                        {category.children.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name_translations.en}</td>
                            <td>{item?.products?.length}</td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <tr>
                        <td colSpan={4}>
                          <Text weight={500} align="center">
                            Nothing Found Subcategories
                          </Text>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              <div
                style={{
                  marginLeft: "20px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Text size="md" weight={500} className={classes.diff}>
                  <span>Products</span>
                </Text>
                <Table
                  horizontalSpacing="md"
                  verticalSpacing="xs"
                  sx={{ tableLayout: "fixed", minWidth: 500 }}
                >
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Subcategorie Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category?.children?.length > 0 ? (
                      <>
                        {category.children.map((item) => (
                          <>
                            {item?.products?.map((product) => (
                              <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{item.name_translations.en}</td>
                              </tr>
                            ))}
                          </>
                        ))}
                      </>
                    ) : (
                      <tr>
                        <td colSpan={4}>
                          <Text weight={500} align="center">
                            Nothing Found Subcategories
                          </Text>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </ScrollArea>
  );
}

export default CategoryDetailModal;
