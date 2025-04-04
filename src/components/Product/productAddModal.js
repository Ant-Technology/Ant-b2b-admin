import {
  Tabs,
  TextInput,
  Textarea,
  Grid,
  Stack,
  Card,
  Button,
  Checkbox,
  ScrollArea,
  LoadingOverlay,
  Group,
  Text,
  ActionIcon,
  SimpleGrid,
  useMantineTheme,
  Select,
} from "@mantine/core";
import { useRef, useState } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import {
  Photo,
  Plus,
  Trash,
  Ban,
  Upload,
  PictureInPicture,
} from "tabler-icons-react";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { customLoader } from "components/utilities/loader";
import { tabList } from "components/utilities/tablist";
import { CREATE_PRODUCT } from "apollo/mutuations";
import {
  GET_MY_PRODUCTS,
  GET_MY_SUPPLIERS_Business,
  GET_PRODUCTS,
  GET_SUPPLIERS,
  NON_PAGINATED_CATEGORIES,
} from "apollo/queries";

const ProductAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
  category_id,
}) => {
  const theme = useMantineTheme();
  const [business, setBusiness] = useState([]);

  const roles = JSON.parse(localStorage.getItem("roles")) || [];
  const hasAdminorManagerPermission = roles.some(
    (permission) => permission === "admin" || permission === "warehouse_manager"
  );
  const hasSupplierOrManagerPermission = roles.some(
    (permission) =>
      permission === "supplier" || permission === "warehouse_manager"
  );
  const hasOnlySupplierPermission = roles.some(
    (permission) => permission === "supplier"
  );
  const { loading: businessLoading } = useQuery(GET_MY_SUPPLIERS_Business, {
    variables: {
      first: parseInt(1000),
      page: 1,
      search: "",
      ordered_by: [
        {
          column: "CREATED_AT",
          order: "DESC",
        },
      ],
    },

    onCompleted(data) {
      const arr = data.myBusinesses.data.map((item) => ({
        label: item.business_name,
        value: item.id,
      }));

      setBusiness(arr);
    },
  });
  const [addProduct, { loading, error }] = useMutation(CREATE_PRODUCT, {
    update(cache, { data: { createProduct } }) {
      const query = !hasSupplierOrManagerPermission ? GET_PRODUCTS : GET_MY_PRODUCTS;

      cache.updateQuery(
        {
          query: query,
          variables: {
            category_id: category_id,
            first: parseInt(10),
            page: activePage,
            ordered_by: [
              {
                column: "CREATED_AT",
                order: "DESC",
              },
            ],
            search: "",
          },
        },
        (data) => {
          if (!hasSupplierOrManagerPermission) {
            return {
              products: {
                ...data.products,
                data: [createProduct, ...data.products.data],
              },
            };
          } else {
            return {
              myProducts: {
                ...data.myProducts,
                data: [createProduct, ...data.myProducts.data],
              },
            };
          }
        }
      );
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: "Failed to create product. Please try again.",
      });
    },
  });

  const { height } = useViewportSize();
  const [dropDownData, setDropDownData] = useState({ enArr: [], amArr: [] });
  const [subcategories, setSubcategories] = useState([]);
  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  // graphql queries
  const { loading: categoryLoading } = useQuery(NON_PAGINATED_CATEGORIES, {
    onCompleted(data) {
      const enArr = data.categoryNonPaginated.map((item) => ({
        label: item.name,
        value: item.id,
        children: item.children,
      }));
      const amArr = data.categoryNonPaginated.map((item) => ({
        label: item.name,
        value: item.id,
        children: item.children,
      }));

      setDropDownData({ enArr, amArr });
    },
  });

  const form = useForm({
    initialValues: {
      name: { am: "", en: "" },
      short_description: { am: "", en: "" },
      description: { am: "", en: "" },
      category: { connect: 10 },
      subcategory: { connect: "" },
      images: [],
      supplier_id: 2,
      is_active: true,
      attributes: {
        create: [
          {
            name: { en: "", am: "" },
            values: { create: [{ value: { en: "", am: "" } }] },
          },
        ],
      },
    },
  });
  const handleSupplierChange = (val) => {
    form.setFieldValue("supplier_id", val);
  };
  const handleAttributeCards = () => {
    return form.values.attributes.create.map((item, index) => (
      <Card key={index} shadow="sm" p="lg" radius="md" withBorder mt="xl">
        <Stack>
          <Group position="apart">
            <Text weight={500}>Attribute {index + 1}</Text>
            <ActionIcon
              color="red"
              onClick={() => form.removeListItem("attributes.create", index)}
            >
              <Ban size={26} strokeWidth={2} color="red" />
            </ActionIcon>
          </Group>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Attribute Name (English)"
                placeholder="Attribute Name"
                {...form.getInputProps(`attributes.create.${index}.name.en`)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Attribute Name (Amharic)"
                placeholder="Attribute Name"
                {...form.getInputProps(`attributes.create.${index}.name.am`)}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Group position="apart" mt="xl">
                <Button
                  onClick={() =>
                    form.insertListItem(
                      `attributes.create.${index}.values.create`,
                      { value: { en: "", am: "" } }
                    )
                  }
                  variant="outline"
                  leftIcon={<Plus />}
                  color="blue"
                  size="xs" // Set the size to 'xs'
                  compact // Make the button more compact
                >
                  Add Value
                </Button>
              </Group>
              {item.values.create.length > 0 ? (
                item.values.create.map((attr, idx) => (
                  <Group key={idx} mt="xs">
                    <TextInput
                      placeholder="Value (English)"
                      required
                      sx={{ flex: 1 }}
                      {...form.getInputProps(
                        `attributes.create.${index}.values.create.${idx}.value.en`
                      )}
                    />
                    <TextInput
                      placeholder="Value (Amharic)"
                      required
                      sx={{ flex: 1 }}
                      {...form.getInputProps(
                        `attributes.create.${index}.values.create.${idx}.value.am`
                      )}
                    />
                    <ActionIcon
                      color="#ed522f"
                      onClick={() =>
                        form.removeListItem(
                          `attributes.create.${index}.values.create`,
                          idx
                        )
                      }
                    >
                      <Trash size={24} />
                    </ActionIcon>
                  </Group>
                ))
              ) : (
                <Text color="dimmed">No values added</Text>
              )}
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>
    ));
  };
  const handleCategoryChange = (val) => {
    form.setFieldValue("category.connect", val);
    const selectedCategory = dropDownData.enArr.find(
      (cat) => cat.value === val
    );
    setSubcategories(selectedCategory ? selectedCategory.children : []);
    form.setFieldValue("subcategory.connect", ""); // Reset subcategory
  };

  const submit = () => {
    let variables = {
      name: form.getInputProps("name").value,
      short_description: form.getInputProps("short_description").value,
      description: form.getInputProps("description").value,
      is_active: form.getInputProps("is_active").value,
      attributes: form.getInputProps("attributes").value,
      images: [...files],
      category: form.getInputProps("subcategory").value,
    };
    if (hasOnlySupplierPermission) {
      variables.supplier_business_id = form.getInputProps("supplier_id").value;
    }
    addProduct({
      variables,
      onCompleted() {
        showNotification({
          color: "green",
          title: "Success",
          message: "Product Created Successfully",
        });

        setOpened(false);
      },
      onError() {
        setOpened(true);
        showNotification({
          color: "red",
          title: "Error",
          message: "Product Not Created Successfully",
        });
      },
    });
  };

  const [activeTab, setActiveTab] = useState(tabList[0].value);
  const [files, setFiles] = useState([]);
  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <div
        key={index}
        style={{
          position: "relative",
          width: "130px",
          height: "130px",
          margin: "10px",
        }}
      >
        <img
          src={imageUrl}
          alt={`Preview ${index}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "8px",
          }}
          onLoad={() => URL.revokeObjectURL(imageUrl)}
        />
        <ActionIcon
          color="red"
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "white",
            borderRadius: "50%",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
          }}
          onClick={() => removeFile(index)}
        >
          <Trash size={20} />
        </ActionIcon>
      </div>
    );
  });
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  return (
    <Tabs color="blue" value={activeTab} onTabChange={setActiveTab}>
      <LoadingOverlay
        visible={loading || categoryLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Product Name (English)"
                  placeholder="Enter product name in English"
                  {...form.getInputProps("name.en")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Product Name (Amharic)"
                  placeholder="Enter product name in Amharic"
                  {...form.getInputProps("name.am")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Textarea
                  placeholder="Short Description"
                  label="Short Description (English)"
                  required
                  {...form.getInputProps("short_description.en")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Textarea
                  placeholder="Short Description"
                  label="Short Description (Amharic)"
                  required
                  {...form.getInputProps("short_description.am")}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <Textarea
                  placeholder="Description"
                  label="Description (English)"
                  required
                  {...form.getInputProps("description.en")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Textarea
                  placeholder="Description"
                  label="Description (Amharic)"
                  required
                  {...form.getInputProps("description.am")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  searchable
                  data={dropDownData.enArr}
                  value={form
                    .getInputProps("category.connect")
                    .value.toString()}
                  onChange={handleCategoryChange}
                  label="Category"
                  placeholder="Pick a category this product belongs to"
                />{" "}
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  searchable
                  data={subcategories.map((sub) => ({
                    label: sub.name,
                    value: sub.id,
                  }))}
                  value={form
                    .getInputProps("subcategory.connect")
                    .value.toString()}
                  onChange={(val) =>
                    form.setFieldValue("subcategory.connect", val)
                  }
                  label="Subcategory"
                  placeholder="Pick a subcategory this product belongs to"
                  disabled={subcategories.length === 0}
                />
              </Grid.Col>
              {hasOnlySupplierPermission && (
                <Grid.Col span={6}>
                  <Select
                    searchable
                    required
                    data={business}
                    value={form.getInputProps("supplier_id").value.toString()}
                    onChange={handleSupplierChange}
                    label="Supplier"
                    placeholder="Pick a supplier this belongs to"
                  />
                </Grid.Col>
              )}
              <Grid.Col style={{ marginTop: "23px" }} span={6}>
                <Button
                  onClick={() => fileInputRef.current.click()}
                  variant="outline"
                  color="blue"
                  fullWidth
                >
                  Upload Images
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  style={{ display: "none" }} // Hide the file input
                  onChange={handleFileChange} // Handle file selection
                />
                <SimpleGrid
                  cols={4}
                  breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                  mt={previews.length > 0 ? "xl" : 0}
                >
                  {previews}
                </SimpleGrid>
              </Grid.Col>

              <Grid.Col span={6}>
                <Group position="left">
                  <Checkbox
                    color="blue"
                    size="lg"
                    checked={form.values.is_active}
                    label="Is active"
                    onChange={(event) => {
                      form.setFieldValue(
                        "is_active",
                        event.currentTarget.checked
                      );
                    }}
                  />
                </Group>
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={12}>
                <Group position="apart">
                  <Text weight={500}>Attributes</Text>
                  <Button
                    variant="blue"
                    color="blue"
                    leftIcon={<Plus size={14} />}
                    onClick={() =>
                      form.insertListItem("attributes.create", {
                        name: { en: "", am: "" },
                        values: {
                          create: [{ value: { en: "", am: "" } }],
                        },
                      })
                    }
                  >
                    Add Attribute
                  </Button>
                </Group>
                {handleAttributeCards()}
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={4}>
                <Button
                  style={{
                    width: "25%",
                    marginTop: "15px",
                    backgroundColor: "#FF6A00",
                    color: "#FFFFFF",
                  }}
                  type="submit"
                  fullWidth
                >
                  Submit
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </form>
      </ScrollArea>
    </Tabs>
  );
};

export default ProductAddModal;
