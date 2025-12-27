import prisma from '../config/database.js';

// Get all categories (with hierarchy)
export const getAllCategories = async (req, res) => {
  try {
    const { flat } = req.query;
    
    if (flat === 'true') {
      // Return flat list
      const categories = await prisma.equipmentCategory.findMany({
        include: {
          _count: {
            select: { equipment: true }
          }
        },
        orderBy: { name: 'asc' }
      });
      
      return res.json(categories);
    }
    
    // Return hierarchical structure (only root categories with children)
    const categories = await prisma.equipmentCategory.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
            _count: {
              select: { equipment: true }
            }
          }
        },
        _count: {
          select: { equipment: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

// Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.equipmentCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: { equipment: true }
            }
          }
        },
        equipment: {
          take: 10,
          select: {
            id: true,
            name: true,
            code: true,
            status: true
          }
        },
        _count: {
          select: { equipment: true, children: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error while fetching category' });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, parentId, responsibleId } = req.body;

    // Validate parent exists if provided
    if (parentId) {
      const parent = await prisma.equipmentCategory.findUnique({
        where: { id: parentId }
      });
      if (!parent) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    // Validate responsible user exists if provided
    if (responsibleId) {
      const responsible = await prisma.user.findUnique({
        where: { id: responsibleId }
      });
      if (!responsible) {
        return res.status(400).json({ message: 'Responsible user not found' });
      }
    }

    const category = await prisma.equipmentCategory.create({
      data: {
        name,
        description,
        icon,
        parentId,
        responsibleId
      },
      include: {
        parent: true,
        responsible: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { equipment: true }
        }
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, parentId, responsibleId } = req.body;

    // Check category exists
    const existing = await prisma.equipmentCategory.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Prevent circular reference
    if (parentId === id) {
      return res.status(400).json({ message: 'Category cannot be its own parent' });
    }

    // Validate parent exists if provided
    if (parentId) {
      const parent = await prisma.equipmentCategory.findUnique({
        where: { id: parentId }
      });
      if (!parent) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
      
      // Check for circular reference in hierarchy
      let currentParent = parent;
      while (currentParent.parentId) {
        if (currentParent.parentId === id) {
          return res.status(400).json({ message: 'Cannot create circular category hierarchy' });
        }
        currentParent = await prisma.equipmentCategory.findUnique({
          where: { id: currentParent.parentId }
        });
      }
    }

    // Validate responsible user exists if provided
    if (responsibleId) {
      const responsible = await prisma.user.findUnique({
        where: { id: responsibleId }
      });
      if (!responsible) {
        return res.status(400).json({ message: 'Responsible user not found' });
      }
    }

    const category = await prisma.equipmentCategory.update({
      where: { id },
      data: {
        name,
        description,
        icon,
        parentId,
        responsibleId
      },
      include: {
        parent: true,
        children: true,
        responsible: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { equipment: true }
        }
      }
    });

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.equipmentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipment: true, children: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has equipment
    if (category._count.equipment > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${category._count.equipment} equipment items. Please reassign them first.` 
      });
    }

    // Check if category has children
    if (category._count.children > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${category._count.children} sub-categories. Please delete or move them first.` 
      });
    }

    await prisma.equipmentCategory.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};

// Get category tree for dropdown/select
export const getCategoryTree = async (req, res) => {
  try {
    const categories = await prisma.equipmentCategory.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
        icon: true
      },
      orderBy: { name: 'asc' }
    });

    // Build tree structure
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };

    const tree = buildTree(categories);
    res.json(tree);
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({ message: 'Server error while fetching category tree' });
  }
};
