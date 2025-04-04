import {
  TextInput,
  Textarea,
  Grid,
  Stack,
  Card,
  Button,
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
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { Plus, Trash, Ban } from "tabler-icons-react";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { customLoader } from "components/utilities/loader";
import { UPDATE_PRODUCT } from "apollo/mutuations";
import { GET_PRODUCT, GET_SUPPLIERS, NON_PAGINATED_CATEGORIES } from "apollo/queries";

const ProductEditModal = ({ editId, openedEdit, setOpenedEdit }) => {
  const theme = useMantineTheme();
  const [updateProduct, { loading: updateProductLoading }] =
    useMutation(UPDATE_PRODUCT);
  const { height } = useViewportSize();
  const [dropDownData, setDropDownData] = useState({ enArr: [], amArr: [] });
  const roles = JSON.parse(localStorage.getItem("roles")) || [];
  const [suppliers, setSuppliers] = useState([]);

  const hasAdminPermission = roles.some((permission) => permission === "admin");
  const { loading: supplierLoading } = useQuery(GET_SUPPLIERS, {
    variables: {
      first: parseInt(1000),
      page: 1,
      search: "",
    },

    onCompleted(data) {
      const arr = data.suppliers.data.map((item) => ({
        label: item.user?.name,
        value: item.id,
      }));

      setSuppliers(arr);
    },
  });
  const form = useForm({
    initialValues: {
      images: {
        delete: [],
        existing: [],
        create: [],
      },
      name: { am: "", en: "" },
      short_description: { am: "", en: "" },
      description: { am: "", en: "" },
      category: { connect: 10 },
      subcategory: { connect: "" },
      supplier_id: 2,
      is_active: true,
      attributes: {
        update: [],
        create: [],
        delete: [],
      },
    },
  });
  const { loading: categoryLoading, data: categoriesData } = useQuery(
    NON_PAGINATED_CATEGORIES,
    {
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
    }
  );

  const { loading } = useQuery(GET_PRODUCT, {
    variables: { id: editId },
    skip: !categoriesData,
    onCompleted(data) {
      const product = data.product;
      const productCategoryId = product.category.id;
      const parentCategory = categoriesData.categoryNonPaginated.find((cat) =>
        cat.children.some((child) => child.id === productCategoryId)
      );
      const forUpdate = product.attributes.map((item) => ({
        id: item.id,
        name: {
          en: item.name_translations.en,
          am: item.name_translations.am,
        },
        values: {
          update: item.values.map((value) => ({
            id: value.id,
            value: {
              en: value.value_translations.en,
              am: value.value_translations.am,
            },
          })),
          create: [],
          delete: [],
        },
      }));
      form.setValues({
        name: {
          am: product.name_translations.am,
          en: product.name_translations.en,
        },
        short_description: {
          am: product.short_description_translations.am,
          en: product.short_description_translations.en,
        },
        description: {
          am: product.description_translations.am,
          en: product.description_translations.en,
        },
        category: { connect: parentCategory?.id || "" },
        subcategory: { connect: productCategoryId },
        images: {
          delete: [],
          existing: product.images,
          create: [],
        },
        is_active: product.is_active,
        attributes: {
          update: forUpdate,
          create: [],
          delete: [],
        },
      });
      if (parentCategory) {
        setSubcategories(parentCategory.children);
      }
    },
  });
  const handleSupplierChange = (val) => {
    form.setFieldValue("supplier_id", val);
  };
  const handleAttributeCards = () => {
    return [
      ...form.values.attributes?.update,
      ...form.values.attributes?.create,
    ].map((item, mainIndex) => {
      const isUpdateAttribute = !!item.id;
      const attributeType = isUpdateAttribute ? "update" : "create";
      const attributeIndex = isUpdateAttribute
        ? mainIndex
        : mainIndex - form.values.attributes.update.length;

      return (
        <Card
          key={item.id || mainIndex}
          shadow="sm"
          p="lg"
          radius="md"
          withBorder
          mt="xl"
        >
          <Stack>
            <Group position="right">
              <ActionIcon
                color="red"
                onClick={() => {
                  if (item.id) {
                    form.removeListItem("attributes.update", mainIndex);
                    form.insertListItem("attributes.delete", parseInt(item.id));
                  } else {
                    form.removeListItem("attributes.create", attributeIndex);
                  }
                }}
              >
                <Ban size={26} strokeWidth={2} color="red" />
              </ActionIcon>
            </Group>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Name (English)"
                  placeholder="Attribute Name (English)"
                  {...form.getInputProps(
                    `attributes.${attributeType}.${attributeIndex}.name.en`
                  )}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Name (Amharic)"
                  placeholder="Attribute Name (Amharic)"
                  {...form.getInputProps(
                    `attributes.${attributeType}.${attributeIndex}.name.am`
                  )}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Group position="apart" mt="xl">
                  <Button
                    onClick={() =>
                      form.insertListItem(
                        `attributes.${attributeType}.${attributeIndex}.values.create`,
                        { value: { en: "", am: "" } }
                      )
                    }
                    variant="outline"
                    leftIcon={<Plus />}
                    color="blue"
                  >
                    Add Value
                  </Button>
                </Group>

                {/* Existing values */}
                {item.values?.update?.map((attr, updateIndex) => (
                  <Group key={attr.id} mt="xs">
                    <TextInput
                      placeholder="Attribute Value (English)"
                      required
                      sx={{ flex: 1 }}
                      {...form.getInputProps(
                        `attributes.${attributeType}.${attributeIndex}.values.update.${updateIndex}.value.en`
                      )}
                    />
                    <TextInput
                      placeholder="Attribute Value (Amharic)"
                      required
                      sx={{ flex: 1 }}
                      {...form.getInputProps(
                        `attributes.${attributeType}.${attributeIndex}.values.update.${updateIndex}.value.am`
                      )}
                    />
                    <ActionIcon
                      color="#ed522f"
                      onClick={() => {
                        form.removeListItem(
                          `attributes.${attributeType}.${attributeIndex}.values.update`,
                          updateIndex
                        );
                        form.insertListItem(
                          `attributes.${attributeType}.${attributeIndex}.values.delete`,
                          attr.id
                        );
                      }}
                    >
                      <Trash size={24} />
                    </ActionIcon>
                  </Group>
                ))}

                {/* New values */}
                {item.values?.create?.map((value, createIndex) => (
                  <Group key={createIndex} mt="xs">
                    <TextInput
                      placeholder="Attribute Value (English)"
                      required
                      sx={{ flex: 1 }}
                      {...form.getInputProps(
                        `attributes.${attributeType}.${attributeIndex}.values.create.${createIndex}.value.en`
                      )}
                    />
                    <TextInput
                      placeholder="Attribute Value (Amharic)"
                      required
                      sx={{ flex: 1 }}
                      {...form.getInputProps(
                        `attributes.${attributeType}.${attributeIndex}.values.create.${createIndex}.value.am`
                      )}
                    />
                    <ActionIcon
                      color="#ed522f"
                      onClick={() => {
                        form.removeListItem(
                          `attributes.${attributeType}.${attributeIndex}.values.create`,
                          createIndex
                        );
                      }}
                    >
                      <Trash size={24} />
                    </ActionIcon>
                  </Group>
                ))}
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>
      );
    });
  };
  const submit = () => {
    let variables = {
      id: editId,
      name: form.getInputProps("name").value,
      short_description: form.getInputProps("short_description").value,
      description: form.getInputProps("description").value,
      is_active: form.getInputProps("is_active").value,
      attributes: form.getInputProps("attributes").value,
      images: {
        create: [...files],
        delete: [...form.getInputProps("images.delete").value],
      },
      category: form.getInputProps("subcategory").value,
    }
    if (hasAdminPermission) {
      variables.supplier_id = form.getInputProps("supplier_id").value.toString();
    }
    updateProduct({
      variables,
      onCompleted() {
        showNotification({
          color: "green",
          title: "Success",
          message: "Product updated Successfully",
        });
        setOpenedEdit(false);
      },
      onError() {
        showNotification({
          color: "red",
          title: "Error",
          message: "Product Not updated Successfully",
        });
      },
    });
  };

  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const previews = [
    ...files.map((file, index) => {
      const imageUrl = URL.createObjectURL(file);
      return (
        <div style={{ position: "relative", margin: "10px" }} key={index}>
          <img src={imageUrl} alt={`Preview ${index}`} width="130" />
          <ActionIcon
            color="red"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
            onClick={() => {
              setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
            }}
          >
            <Trash size={20} />
          </ActionIcon>
        </div>
      );
    }),
    ...(form.values.images?.existing || []).map((image, index) => (
      <div style={{ position: "relative", margin: "10px" }} key={index}>
        <img
          src={image.original_url}
          alt={`Existing Image ${index}`}
          width="130"
        />
        <ActionIcon
          color="red"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
          }}
          onClick={() => {
            form.insertListItem("images.delete", parseInt(image.id));
            form.removeListItem("images.existing", index);
          }}
        >
          <Trash size={20} />
        </ActionIcon>
      </div>
    )),
  ];
  const [subcategories, setSubcategories] = useState([]);

  const handleCategoryChange = (val) => {
    form.setFieldValue("category.connect", val);
    const selectedCategory = dropDownData.enArr.find(
      (cat) => cat.value === val
    );
    setSubcategories(selectedCategory ? selectedCategory.children : []);
    form.setFieldValue("subcategory.connect", ""); // Reset subcategory on parent change
  };
  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <LoadingOverlay
        visible={loading || updateProductLoading || categoryLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
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
                value={form.getInputProps("category.connect").value?.toString()}
                onChange={handleCategoryChange}
                label="Category"
                placeholder="Pick a category this product belongs to"
              />
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
                  .value?.toString()}
                onChange={(val) =>
                  form.setFieldValue("subcategory.connect", val)
                }
                label="Subcategory"
                placeholder="Pick a subcategory this product belongs to"
                disabled={subcategories.length === 0}
              />
            </Grid.Col>
            {hasAdminPermission && (
              <Grid.Col span={6}>
                <Select
                  searchable
                  required
                  data={suppliers}
                  value={form.getInputProps("supplier_id").value.toString()}
                  onChange={handleSupplierChange}
                  label="Supplier"
                  placeholder="Pick a supplier this belongs to"
                />
              </Grid.Col>
            )}
            <Grid.Col span={6}>
              <Button
                onClick={() => fileInputRef.current.click()} // Trigger file input on button click
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
  );
};

export default ProductEditModal;
